import fs from "node:fs";
import path from "node:path";
import {
  graphRoot,
  readJson,
} from "./lib.mjs";

const indexFile = path.join(
  graphRoot,
  "generated/indexes/graph-index.json",
);

const reportFile = path.join(
  graphRoot,
  "reports/validation-report.json",
);

console.log("");
console.log("BAYAN Learning Knowledge Graph");
console.log("==============================");

if (!fs.existsSync(indexFile)) {
  console.log("Status: not-built");
  process.exit(1);
}

const index = readJson(indexFile);

console.log("Status: ready");
console.log(`Version: ${index.version}`);
console.log(`Generated: ${index.generatedAt}`);
console.log(`Nodes: ${index.statistics.nodeCount}`);
console.log(`Edges: ${index.statistics.edgeCount}`);
console.log(
  `Orphan nodes: ${index.statistics.orphanNodes.length}`,
);

console.log("");
console.log("Nodes by type:");

for (
  const [type, count]
  of Object.entries(index.statistics.nodesByType)
) {
  console.log(`- ${type}: ${count}`);
}

console.log("");
console.log("Nodes by level:");

for (const level of ["A0", "A1", "A2", "B1", "B2", "GLOBAL"]) {
  console.log(
    `- ${level}: ${
      index.statistics.nodesByLevel[level] ?? 0
    }`,
  );
}

console.log("");
console.log("Edges by type:");

for (
  const [type, count]
  of Object.entries(index.statistics.edgesByType)
) {
  console.log(`- ${type}: ${count}`);
}

if (fs.existsSync(reportFile)) {
  const report = readJson(reportFile);

  console.log("");
  console.log(
    `Validation: ${report.valid ? "passed" : "failed"}`,
  );
  console.log(`Warnings: ${report.warnings.length}`);
}
