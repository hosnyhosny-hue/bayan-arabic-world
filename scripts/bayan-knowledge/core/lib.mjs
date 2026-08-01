import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(currentDirectory, "../../..");

export const coreRoot = path.join(
  projectRoot,
  "app/learn/arabic-b/knowledge/core",
);

export const manifestFile = path.join(coreRoot, "manifest.json");

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

export function loadCollections() {
  const manifest = readJson(manifestFile);

  return manifest.collections.map((relativePath) => {
    const absolutePath = path.join(coreRoot, relativePath);
    const value = readJson(absolutePath);

    return {
      relativePath,
      absolutePath,
      value,
    };
  });
}

export function countArabicCharacters(value = "") {
  return [...String(value)].filter((character) =>
    /[\u0600-\u06ff]/u.test(character),
  ).length;
}

export function flattenItems(collections) {
  const result = [];

  for (const collection of collections) {
    if (Array.isArray(collection.value)) {
      for (const item of collection.value) {
        result.push({
          ...item,
          _collection: collection.relativePath,
        });
      }
      continue;
    }

    if (Array.isArray(collection.value.levels)) {
      for (const level of collection.value.levels) {
        result.push({
          ...level,
          type: "framework-level",
          _collection: collection.relativePath,
        });
      }
    }
  }

  return result;
}
