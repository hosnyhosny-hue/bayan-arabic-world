import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  readJson,
  sha256,
  slugify,
  sourceManifestPath,
  writeJson,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.file || !args.title) {
  console.error(
    'Usage: npm run bayan:knowledge:source -- --file "/path/book.pdf" --title "Title" [--grade 7] [--language ar] [--license reference-only]',
  );
  process.exit(1);
}

const file = path.resolve(String(args.file));
if (!fs.existsSync(file)) {
  console.error(`Source file not found: ${file}`);
  process.exit(1);
}

const manifest = readJson(sourceManifestPath);
const id = String(args.id ?? slugify(String(args.title)));
const record = {
  id,
  title: String(args.title),
  fileName: path.basename(file),
  originalPath: file,
  mediaType:
    path.extname(file).toLowerCase() === ".pdf"
      ? "application/pdf"
      : "application/octet-stream",
  grade: args.grade ? Number(args.grade) : undefined,
  language: String(args.language ?? "ar"),
  license: String(args.license ?? "reference-only"),
  checksumSha256: sha256(file),
  registeredAt: new Date().toISOString(),
  extractionStatus: "registered",
  reviewStatus: "pending",
};

manifest.sources = [
  ...manifest.sources.filter((item) => item.id !== id),
  record,
].sort((a, b) => a.id.localeCompare(b.id));
manifest.updatedAt = new Date().toISOString();

writeJson(sourceManifestPath, manifest);
console.log(`✓ Source registered: ${id}`);
console.log(`  ${record.fileName}`);
