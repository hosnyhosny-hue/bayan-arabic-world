import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const repoRoot = process.cwd();
export const knowledgeRoot = path.join(
  repoRoot,
  "app/learn/arabic-b/knowledge",
);
export const rawLessonsDir = path.join(knowledgeRoot, "raw/lessons");
export const generatedDir = path.join(knowledgeRoot, "generated");
export const sourceManifestPath = path.join(
  knowledgeRoot,
  "sources/manifest.json",
);

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function walkJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory()
        ? walkJson(full)
        : entry.name.endsWith(".json")
          ? [full]
          : [];
    })
    .sort();
}

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

export function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1]?.startsWith("--")
      ? true
      : (argv[++index] ?? true);
    result[key] = value;
  }
  return result;
}

export function unique(values) {
  return [...new Set(values)];
}
