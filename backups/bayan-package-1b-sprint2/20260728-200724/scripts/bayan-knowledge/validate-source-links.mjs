import path from "node:path";
import { lessonsDir, loadManifest, readJson, walkJson } from "./source-lib.mjs";

const manifest = loadManifest();
const sourceIds = new Set(manifest.sources.map((source) => source.id));
const lessons = walkJson(lessonsDir);

let errors = 0;
let warnings = 0;

for (const file of lessons) {
  const lesson = readJson(file);
  const label = path.relative(process.cwd(), file);

  for (const reference of lesson.sources ?? []) {
    if (!reference.sourceId) {
      errors += 1;
      console.error(`✗ ${label}: source reference has no sourceId`);
      continue;
    }

    if (!sourceIds.has(reference.sourceId)) {
      warnings += 1;
      console.warn(`⚠ ${label}: unregistered sourceId "${reference.sourceId}"`);
    }

    if (
      reference.pageStart &&
      reference.pageEnd &&
      Number(reference.pageStart) > Number(reference.pageEnd)
    ) {
      errors += 1;
      console.error(
        `✗ ${label}: pageStart exceeds pageEnd for ${reference.sourceId}`,
      );
    }
  }
}

if (errors > 0) {
  console.error(`✗ ${errors} source-link error(s), ${warnings} warning(s)`);
  process.exit(1);
}

console.log(`✓ Source-link validation passed with ${warnings} warning(s)`);
