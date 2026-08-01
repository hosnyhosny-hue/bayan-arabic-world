import path from "node:path";
import {
  coreRoot,
  countArabicCharacters,
  flattenItems,
  loadCollections,
  writeJson,
} from "./lib.mjs";

const allowedLevels = new Set(["A0", "A1", "A2", "B1", "B2"]);
const allowedLicenses = new Set([
  "BAYAN-Proprietary",
  "CC0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "Public-Domain",
]);

const errors = [];
const warnings = [];
const collections = loadCollections();
const items = flattenItems(collections);
const ids = new Map();

for (const collection of collections) {
  if (
    !Array.isArray(collection.value) &&
    !Array.isArray(collection.value?.levels)
  ) {
    errors.push(
      `${collection.relativePath}: collection must be an array or framework with levels.`,
    );
  }
}

for (const item of items) {
  const location = `${item._collection}:${item.id ?? "missing-id"}`;

  if (!item.id || typeof item.id !== "string") {
    errors.push(`${location}: missing id.`);
  } else if (ids.has(item.id)) {
    errors.push(
      `${location}: duplicate id also found in ${ids.get(item.id)}.`,
    );
  } else {
    ids.set(item.id, item._collection);
  }

  if (item.level && !allowedLevels.has(item.level)) {
    errors.push(`${location}: unsupported level ${item.level}.`);
  }

  if (
    item.type !== "framework-level" &&
    !item.source
  ) {
    errors.push(`${location}: missing source.`);
  }

  if (
    item.type !== "framework-level" &&
    !item.license
  ) {
    errors.push(`${location}: missing license.`);
  }

  if (
    item.license &&
    !allowedLicenses.has(item.license)
  ) {
    errors.push(
      `${location}: license "${item.license}" is not on the approved list.`,
    );
  }

  const serialized = JSON.stringify(item);

  if (countArabicCharacters(serialized) === 0) {
    warnings.push(`${location}: no Arabic characters detected.`);
  }

  if (
    item.source === "BAYAN-original" &&
    item.license !== "BAYAN-Proprietary"
  ) {
    errors.push(
      `${location}: BAYAN-original content must use BAYAN-Proprietary license.`,
    );
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  valid: errors.length === 0,
  collectionCount: collections.length,
  itemCount: items.length,
  uniqueIds: ids.size,
  errors,
  warnings,
};

writeJson(
  path.join(coreRoot, "reports/validation-report.json"),
  report,
);

if (errors.length > 0) {
  console.error("BAYAN Knowledge Core validation failed.");
  for (const error of errors) {
    console.error(`✗ ${error}`);
  }
  process.exit(1);
}

console.log("✓ BAYAN Knowledge Core validation passed");
console.log(`  collections: ${collections.length}`);
console.log(`  items: ${items.length}`);
console.log(`  warnings: ${warnings.length}`);
