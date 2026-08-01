import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(currentDirectory, "../../..");

export const coreRoot = path.join(
  projectRoot,
  "app/learn/arabic-b/knowledge/core",
);

export const graphRoot = path.join(coreRoot, "graph");

export const knowledgeIndexFile = path.join(
  coreRoot,
  "generated/knowledge-index.json",
);

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

export function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function shortHash(value) {
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest("hex")
    .slice(0, 12);
}

export function nodePrefix(type) {
  const prefixes = {
    "framework-level": "level",
    vocabulary: "vocab",
    grammar: "grammar",
    skill: "skill",
    dialogue: "dialogue",
    culture: "culture",
    assessment: "assessment",
    topic: "topic",
    unit: "unit",
    lesson: "lesson",
    mission: "mission",
    story: "story",
    media: "media",
  };

  return prefixes[type] ?? slugify(type) ?? "node";
}

export function makeGraphId(item) {
  const prefix = nodePrefix(item.type);
  const level = String(item.level ?? "global").toLowerCase();
  const stableSourceId = String(item.id ?? shortHash(JSON.stringify(item)));

  return `${prefix}:${level}:${stableSourceId}`;
}

export function makeEdgeId(from, type, to) {
  return `edge:${shortHash(`${from}|${type}|${to}`)}`;
}

export function normalizeStringArray(values) {
  return [...new Set(
    (values ?? [])
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean),
  )];
}

export function extractTopics(item) {
  return normalizeStringArray([
    item.topic,
    item.situation,
    ...(item.tags ?? []),
    ...(item.targets ?? []),
    ...(item.learningFocus ?? []),
  ]);
}

export function getNodeLabel(item) {
  return (
    item.arabic ??
    item.titleAr ??
    item.nameAr ??
    item.objectiveAr ??
    item.promptAr ??
    item.id
  );
}

export function getNodeLabelEn(item) {
  return (
    item.translationEn ??
    item.titleEn ??
    item.nameEn ??
    null
  );
}

export function createEdge({
  from,
  to,
  type,
  weight = 1,
  origin = "generated",
  evidence = [],
  status = "active",
}) {
  return {
    id: makeEdgeId(from, type, to),
    from,
    to,
    type,
    weight,
    origin,
    evidence: normalizeStringArray(evidence),
    status,
  };
}

export function uniqueById(items) {
  const map = new Map();

  for (const item of items) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  return [...map.values()];
}
