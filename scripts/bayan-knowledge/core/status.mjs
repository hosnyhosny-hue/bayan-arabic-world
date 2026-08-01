import fs from "node:fs";
import path from "node:path";
import { coreRoot, readJson } from "./lib.mjs";

const indexFile = path.join(
  coreRoot,
  "generated/knowledge-index.json",
);

const validationFile = path.join(
  coreRoot,
  "reports/validation-report.json",
);

console.log("BAYAN Knowledge Core");
console.log("====================");

if (!fs.existsSync(indexFile)) {
  console.log("Status: index-not-built");
  process.exit(1);
}

const index = readJson(indexFile);

console.log("Status: ready");
console.log(`Version: ${index.version}`);
console.log(`Items: ${index.totalItems}`);
console.log(`Generated: ${index.generatedAt}`);
console.log("");

console.log("By level:");
for (const level of ["A0", "A1", "A2", "B1", "B2"]) {
  console.log(
    `- ${level}: ${index.statistics.byLevel[level] ?? 0}`,
  );
}

console.log("");
console.log("By type:");
for (const [type, count] of Object.entries(
  index.statistics.byType,
)) {
  console.log(`- ${type}: ${count}`);
}

if (fs.existsSync(validationFile)) {
  const validation = readJson(validationFile);
  console.log("");
  console.log(
    `Validation: ${validation.valid ? "passed" : "failed"}`,
  );
  console.log(`Warnings: ${validation.warnings.length}`);
}
