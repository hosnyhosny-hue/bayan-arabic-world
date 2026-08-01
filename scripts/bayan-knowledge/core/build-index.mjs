import path from "node:path";
import {
  coreRoot,
  flattenItems,
  loadCollections,
  writeJson,
} from "./lib.mjs";

const collections = loadCollections();
const items = flattenItems(collections);

const normalized = items.map((item) => {
  const {
    _collection,
    ...content
  } = item;

  const searchableText = [
    content.id,
    content.level,
    content.type,
    content.arabic,
    content.titleAr,
    content.titleEn,
    content.translationEn,
    content.objectiveAr,
    content.summaryAr,
    content.explanationAr,
    content.function,
    ...(content.tags ?? []),
    ...(content.targets ?? []),
    ...(content.examples ?? []).flatMap((example) =>
      typeof example === "string"
        ? [example]
        : [example.arabic, example.translationEn],
    ),
    ...(content.turns ?? []).flatMap((turn) => [
      turn.speaker,
      turn.arabic,
      turn.translationEn,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    ...content,
    collection: _collection,
    searchableText,
  };
});

const byLevel = Object.groupBy(
  normalized.filter((item) => item.level),
  (item) => item.level,
);

const byType = Object.groupBy(
  normalized.filter((item) => item.type),
  (item) => item.type,
);

const index = {
  generatedAt: new Date().toISOString(),
  version: "1.0.0",
  totalItems: normalized.length,
  statistics: {
    byLevel: Object.fromEntries(
      Object.entries(byLevel).map(([key, value]) => [
        key,
        value.length,
      ]),
    ),
    byType: Object.fromEntries(
      Object.entries(byType).map(([key, value]) => [
        key,
        value.length,
      ]),
    ),
  },
  items: normalized,
};

writeJson(
  path.join(coreRoot, "generated/knowledge-index.json"),
  index,
);

for (const level of ["A0", "A1", "A2", "B1", "B2"]) {
  writeJson(
    path.join(
      coreRoot,
      `generated/levels/${level.toLowerCase()}.json`,
    ),
    {
      level,
      generatedAt: index.generatedAt,
      items: normalized.filter((item) => item.level === level),
    },
  );
}

console.log("✓ BAYAN Knowledge Index built");
console.log(`  items: ${index.totalItems}`);

for (const [level, count] of Object.entries(
  index.statistics.byLevel,
)) {
  console.log(`  ${level}: ${count}`);
}
