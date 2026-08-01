import path from "node:path";
import {
  createSearchDocument,
  extractTopics,
  getNodeLabel,
  getNodeLabelEn,
  graphRoot,
  knowledgeIndexFile,
  makeGraphId,
  normalizeArabic,
  normalizeLoose,
  readJson,
  resolveItemLevel,
  tokenize,
  writeJson,
} from "./lib.mjs";

const knowledgeIndex = readJson(
  knowledgeIndexFile,
);

const nodes = knowledgeIndex.items.map((item) => {
  const searchDocument =
    createSearchDocument(item);

  const label = String(
    getNodeLabel(item),
  );

  const labelEn = getNodeLabelEn(item);
  const level = resolveItemLevel(item);

  return {
    graphId: makeGraphId({
      ...item,
      level,
    }),
    sourceId: String(item.id),
    type: item.type,
    level,
    label,
    labelEn,
    sourceCollection: item.collection,
    status:
      item.reviewStatus === "review-required"
        ? "review-required"
        : "active",
    topics: extractTopics(item),
    searchableText:
      item.searchableText ?? searchDocument,
    normalizedLabel: normalizeArabic(label),
    normalizedLabelLoose: normalizeLoose(label),
    normalizedSearchText:
      normalizeArabic(searchDocument),
    searchTokens: tokenize(searchDocument),
    metadata: {
      license: item.license ?? null,
      source: item.source ?? null,
      skill:
        item.skill ??
        item.skillType ??
        item.modality ??
        null,
      questionType:
        item.questionType ?? null,
      partOfSpeech:
        item.partOfSpeech ?? null,
      situation:
        item.situation ??
        item.context ??
        null,
      difficulty:
        item.difficulty ?? null,
      originalIndexItem: item,
    },
  };
});

const registry = {
  generatedAt: new Date().toISOString(),
  version: "2.0.0",
  totalNodes: nodes.length,
  nodes,
};

writeJson(
  path.join(
    graphRoot,
    "generated/nodes/nodes.json",
  ),
  registry,
);

console.log("✓ Graph nodes rebuilt");
console.log(`  base nodes: ${nodes.length}`);
console.log(
  "  Arabic-normalized search: enabled",
);
console.log(
  "  Framework levels: resolved from IDs",
);
