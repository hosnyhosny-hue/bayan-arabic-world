import { loadTextManifest } from "./lib.mjs";

const manifest = loadTextManifest();
console.log("BAYAN Text Extraction Status");
console.log("============================");

if (manifest.items.length === 0) {
  console.log("No text extraction records.");
  process.exit(0);
}

for (const item of manifest.items) {
  console.log(
    `- ${item.sourceId} | ${item.status} | ${item.documentType} | ${item.pageCount} pages | ${item.totalWords} words`,
  );
}
