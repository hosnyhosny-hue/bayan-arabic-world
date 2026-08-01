import path from "node:path";
import { loadTextManifest, reportsRoot, writeJson } from "./lib.mjs";

const manifest = loadTextManifest();
const byStatus = {};
const byDocumentType = {};

for (const item of manifest.items) {
  byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
  byDocumentType[item.documentType] =
    (byDocumentType[item.documentType] ?? 0) + 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  totalSources: manifest.items.length,
  byStatus,
  byDocumentType,
  totals: {
    pages: manifest.items.reduce(
      (sum, item) => sum + Number(item.pageCount ?? 0),
      0,
    ),
    words: manifest.items.reduce(
      (sum, item) => sum + Number(item.totalWords ?? 0),
      0,
    ),
    characters: manifest.items.reduce(
      (sum, item) => sum + Number(item.totalCharacters ?? 0),
      0,
    ),
  },
  ocrRequired: manifest.items
    .filter((item) => item.status === "ocr-required")
    .map((item) => item.sourceId),
  failures: manifest.items
    .filter((item) => item.status === "failed")
    .map((item) => ({
      sourceId: item.sourceId,
      lastError: item.lastError,
    })),
};

const file = path.join(reportsRoot, "text-extraction-report.json");
writeJson(file, report);

console.log("BAYAN Text Extraction Report");
console.log("============================");
console.log(`Sources: ${report.totalSources}`);
console.log(`Pages: ${report.totals.pages}`);
console.log(`Words: ${report.totals.words}`);
console.log(`OCR required: ${report.ocrRequired.length}`);
console.log(`Failures: ${report.failures.length}`);
console.log(`✓ Report written to ${path.relative(process.cwd(), file)}`);
