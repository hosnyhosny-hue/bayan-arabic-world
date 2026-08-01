import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const projectRoot = process.cwd();
export const knowledgeRoot = path.join(
  projectRoot,
  "app/learn/arabic-b/knowledge",
);
export const manifestPath = path.join(knowledgeRoot, "sources/manifest.json");
export const reportsDir = path.join(knowledgeRoot, "sources/reports");
export const lessonsDir = path.join(knowledgeRoot, "raw/lessons");

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

export function detectMediaType(file) {
  const ext = path.extname(file).toLowerCase();
  const map = {
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext] ?? "application/octet-stream";
}

export function loadManifest() {
  const existing = readJson(manifestPath);
  return {
    version: Math.max(Number(existing.version ?? 1), 2),
    updatedAt: existing.updatedAt ?? "",
    sources: Array.isArray(existing.sources) ? existing.sources : [],
  };
}

export function saveManifest(manifest) {
  manifest.version = 2;
  manifest.updatedAt = new Date().toISOString();
  manifest.sources = [...manifest.sources].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  writeJson(manifestPath, manifest);
}

export function createSourceRecord(file, args = {}) {
  const resolved = path.resolve(file);
  const checksum = sha256(resolved);
  const title = String(
    args.title ?? path.basename(resolved, path.extname(resolved)),
  );
  const timestamp = new Date().toISOString();

  return {
    id: String(args.id ?? `${slugify(title)}-${checksum.slice(0, 8)}`),
    title,
    author: args.author ? String(args.author) : undefined,
    publisher: args.publisher ? String(args.publisher) : undefined,
    publicationYear: args.year ? Number(args.year) : undefined,
    edition: args.edition ? String(args.edition) : undefined,
    isbn: args.isbn ? String(args.isbn) : undefined,
    fileName: path.basename(resolved),
    originalPath: resolved,
    mediaType: detectMediaType(resolved),
    sourceType: String(args.type ?? "reference"),
    grade: args.grade ? Number(args.grade) : undefined,
    cefr: args.cefr ? String(args.cefr) : undefined,
    language: String(args.language ?? "ar"),
    license: String(args.license ?? "reference-only"),
    pageCount: args.pages ? Number(args.pages) : undefined,
    checksumSha256: checksum,
    registeredAt: timestamp,
    updatedAt: timestamp,
    lifecycle: "registered",
    reviewStatus: "pending",
    notes: args.notes ? String(args.notes) : undefined,
    tags: args.tags
      ? String(args.tags)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  };
}

export function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefined(item)]),
  );
}

export function walkFiles(dir, recursive) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return recursive ? walkFiles(full, recursive) : [];
      }
      return [full];
    })
    .sort();
}

export function walkJson(dir) {
  return walkFiles(dir, true).filter((file) =>
    file.toLowerCase().endsWith(".json"),
  );
}

export const supportedExtensions = new Set([
  ".pdf",
  ".docx",
  ".json",
  ".mp3",
  ".wav",
  ".mp4",
]);
