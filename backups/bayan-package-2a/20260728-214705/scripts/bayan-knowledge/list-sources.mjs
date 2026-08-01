import { loadManifest } from "./source-lib.mjs";

const manifest = loadManifest();

console.log("BAYAN Source Registry");
console.log("=====================");

if (manifest.sources.length === 0) {
  console.log("No sources registered.");
  process.exit(0);
}

for (const source of manifest.sources) {
  console.log(
    `- ${source.id} | ${source.sourceType} | ${source.lifecycle} | ${source.reviewStatus}`,
  );
  console.log(`  ${source.title}`);
  console.log(`  ${source.fileName}`);
}
