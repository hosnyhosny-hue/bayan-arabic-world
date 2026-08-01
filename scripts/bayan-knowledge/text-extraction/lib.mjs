import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const projectRoot = process.cwd();
export const knowledgeRoot = path.join(
  projectRoot,
  "app/learn/arabic-b/knowledge",
);
export const sourceManifestPath = path.join(
  knowledgeRoot,
  "sources/manifest.json",
);
export const queuePath = path.join(knowledgeRoot, "extraction/queue.json");
export const configPath = path.join(
  knowledgeRoot,
  "text-extraction/config.json",
);
export const textManifestPath = path.join(
  knowledgeRoot,
  "text-extraction/manifest.json",
);
export const artifactsRoot = path.join(
  knowledgeRoot,
  "text-extraction/artifacts",
);
export const reportsRoot = path.join(knowledgeRoot, "text-extraction/reports");

export function now() {
  return new Date().toISOString();
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export function loadConfig() {
  return readJson(configPath);
}

export function loadSources() {
  return readJson(sourceManifestPath);
}

export function saveSources(value) {
  value.updatedAt = now();
  writeJson(sourceManifestPath, value);
}

export function loadQueue() {
  return readJson(queuePath);
}

export function saveQueue(value) {
  value.updatedAt = now();
  writeJson(queuePath, value);
}

export function loadTextManifest() {
  if (!fs.existsSync(textManifestPath)) {
    return { version: 1, updatedAt: "", items: [] };
  }
  return readJson(textManifestPath);
}

export function saveTextManifest(value) {
  value.updatedAt = now();
  value.items.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  writeJson(textManifestPath, value);
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function commandExists(command) {
  try {
    execFileSync("sh", ["-lc", `command -v ${command}`], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function sha256File(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

export function slugSafe(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

export function normalizeArabic(text, config) {
  let value = text.replace(/\r\n?/g, "\n");
  value = value.replace(/[ \t]+\n/g, "\n");
  value = value.replace(/\n{3,}/g, "\n\n");
  value = value.replace(/[ \t]{2,}/g, " ");

  const options = config.arabicNormalization ?? {};
  if (options.removeTatweel) value = value.replace(/\u0640/g, "");
  if (options.normalizeAlef) value = value.replace(/[إأآٱ]/g, "ا");
  if (options.normalizeYa) value = value.replace(/ى/g, "ي");
  if (options.normalizeTaMarbuta) value = value.replace(/ة/g, "ه");
  if (options.removeDiacritics) {
    value = value.replace(
      /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
      "",
    );
  }

  return value.trim() + "\n";
}

export function cleanPageText(text) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function wordCount(text) {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

export function characterCount(text) {
  return [...text].length;
}

export function paragraphCount(text) {
  return text
    .split(/\n\s*\n/)
    .map((value) => value.trim())
    .filter(Boolean).length;
}

export function arabicCharacterRatio(text) {
  const letters = text.match(/[\p{L}]/gu) ?? [];
  if (letters.length === 0) return 0;
  const arabic = text.match(/[\u0600-\u06FF]/g) ?? [];
  return arabic.length / letters.length;
}

export function resolveSourceFile(source) {
  const candidates = [source.originalPath, source.path, source.filePath].filter(
    Boolean,
  );

  for (const candidate of candidates) {
    const absolute = path.isAbsolute(candidate)
      ? candidate
      : path.resolve(projectRoot, candidate);
    if (fs.existsSync(absolute)) return absolute;
  }
  return null;
}
