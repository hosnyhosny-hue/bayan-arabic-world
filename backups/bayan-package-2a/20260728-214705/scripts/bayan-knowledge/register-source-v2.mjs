import fs from "node:fs";
import path from "node:path";
import {
  createSourceRecord,
  loadManifest,
  parseArgs,
  removeUndefined,
  saveManifest,
} from "./source-lib.mjs";

const args = parseArgs(process.argv.slice(2));

if (!args.file) {
  console.error(
    'Usage: npm run bayan:source:register -- --file "/path/book.pdf" --title "Title"',
  );
  process.exit(1);
}

const file = path.resolve(String(args.file));
if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
  console.error(`Source file not found: ${file}`);
  process.exit(1);
}

const manifest = loadManifest();
const record = removeUndefined(createSourceRecord(file, args));

const duplicate = manifest.sources.find(
  (source) => source.checksumSha256 === record.checksumSha256,
);

if (duplicate && duplicate.id !== record.id) {
  console.log(`✓ Duplicate content already registered: ${duplicate.id}`);
  console.log(`  ${duplicate.fileName}`);
  process.exit(0);
}

const existing = manifest.sources.find((source) => source.id === record.id);
if (existing) {
  record.registeredAt = existing.registeredAt;
}

manifest.sources = [
  ...manifest.sources.filter((source) => source.id !== record.id),
  record,
];

saveManifest(manifest);

console.log(`✓ Source registered: ${record.id}`);
console.log(`  title: ${record.title}`);
console.log(`  type: ${record.sourceType}`);
console.log(`  checksum: ${record.checksumSha256.slice(0, 16)}…`);
