import fs from "node:fs";
import path from "node:path";
import { loadSources, loadTextManifest, projectRoot } from "./lib.mjs";

const sources = loadSources();
const manifest = loadTextManifest();
const sourceIds = new Set((sources.sources ?? []).map((source) => source.id));
const seen = new Set();
let errors = 0;

for (const item of manifest.items) {
  if (seen.has(item.sourceId)) {
    console.error(`✗ Duplicate text record: ${item.sourceId}`);
    errors += 1;
  }
  seen.add(item.sourceId);

  if (!sourceIds.has(item.sourceId)) {
    console.error(`✗ Missing source: ${item.sourceId}`);
    errors += 1;
  }

  if (item.status === "extracted") {
    const directory = path.resolve(projectRoot, item.artifactDirectory);
    for (const required of [
      "raw.txt",
      "normalized.txt",
      "page-map.json",
      "diagnostics.json",
      "extraction.json",
    ]) {
      if (!fs.existsSync(path.join(directory, required))) {
        console.error(`✗ Missing ${required}: ${item.sourceId}`);
        errors += 1;
      }
    }

    if (item.totalCharacters <= 0 || item.totalWords <= 0) {
      console.error(`✗ Extracted record has no usable text: ${item.sourceId}`);
      errors += 1;
    }
  }
}

if (errors > 0) {
  console.error(`✗ Text extraction verification failed: ${errors}`);
  process.exit(1);
}

console.log(
  `✓ Text extraction verification passed: ${manifest.items.length} record(s)`,
);
