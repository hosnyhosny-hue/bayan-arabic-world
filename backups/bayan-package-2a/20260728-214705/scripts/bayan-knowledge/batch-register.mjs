import fs from "node:fs";
import path from "node:path";
import {
  createSourceRecord,
  loadManifest,
  parseArgs,
  removeUndefined,
  saveManifest,
  supportedExtensions,
  walkFiles,
} from "./source-lib.mjs";

const args = parseArgs(process.argv.slice(2));

if (!args.dir) {
  console.error(
    'Usage: npm run bayan:source:batch -- --dir "/path/books" [--recursive]',
  );
  process.exit(1);
}

const dir = path.resolve(String(args.dir));
if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.error(`Import directory not found: ${dir}`);
  process.exit(1);
}

const manifest = loadManifest();
const files = walkFiles(dir, Boolean(args.recursive)).filter((file) =>
  supportedExtensions.has(path.extname(file).toLowerCase()),
);

let registered = 0;
let duplicates = 0;
let updated = 0;

for (const file of files) {
  const record = removeUndefined(
    createSourceRecord(file, {
      ...args,
      title: path.basename(file, path.extname(file)),
    }),
  );

  const checksumMatch = manifest.sources.find(
    (source) => source.checksumSha256 === record.checksumSha256,
  );

  if (checksumMatch) {
    duplicates += 1;
    continue;
  }

  const idMatch = manifest.sources.find((source) => source.id === record.id);
  if (idMatch) {
    record.registeredAt = idMatch.registeredAt;
    updated += 1;
  } else {
    registered += 1;
  }

  manifest.sources = [
    ...manifest.sources.filter((source) => source.id !== record.id),
    record,
  ];
}

saveManifest(manifest);

console.log("✓ Batch source registration complete");
console.log(`  files scanned: ${files.length}`);
console.log(`  registered: ${registered}`);
console.log(`  updated: ${updated}`);
console.log(`  duplicates skipped: ${duplicates}`);
