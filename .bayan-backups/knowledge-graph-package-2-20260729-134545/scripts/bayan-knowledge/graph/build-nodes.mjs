import path from "node:path";
import {
  extractTopics,
  getNodeLabel,
  getNodeLabelEn,
  graphRoot,
  knowledgeIndexFile,
  makeGraphId,
  readJson,
  writeJson,
} from "./lib.mjs";

const knowledgeIndex = readJson(knowledgeIndexFile);

const nodes = knowledgeIndex.items.map((item) => ({
  graphId: makeGraphId(item),
  sourceId: item.id,
  type: item.type,
  level: item.level ?? null,
  label: getNodeLabel(item),
  labelEn: getNodeLabelEn(item),
  sourceCollection: item.collection,
  status:
    item.reviewStatus === "review-required"
      ? "review-required"
      : "active",
  topics: extractTopics(item),
  searchableText: item.searchableText ?? "",
  metadata: {
    license: item.license ?? null,
    source: item.source ?? null,
    skill: item.skill ?? null,
    questionType: item.questionType ?? null,
    partOfSpeech: item.partOfSpeech ?? null,
    situation: item.situation ?? null,
  },
}));

const registry = {
  generatedAt: new Date().toISOString(),
  version: "1.0.0",
  totalNodes: nodes.length,
  nodes,
};

writeJson(
  path.join(graphRoot, "generated/nodes/nodes.json"),
  registry,
);

console.log("✓ Graph nodes built");
console.log(`  nodes: ${nodes.length}`);
