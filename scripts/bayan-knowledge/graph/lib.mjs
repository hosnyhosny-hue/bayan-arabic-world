import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const currentDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

export const projectRoot = path.resolve(
  currentDirectory,
  "../../..",
);

export const coreRoot = path.join(
  projectRoot,
  "app/learn/arabic-b/knowledge/core",
);

export const graphRoot = path.join(
  coreRoot,
  "graph",
);

export const knowledgeIndexFile = path.join(
  coreRoot,
  "generated/knowledge-index.json",
);

export const BAYAN_LEVELS = [
  "A0",
  "A1",
  "A2",
  "B1",
  "B2",
];

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), {
    recursive: true,
  });

  fs.writeFileSync(
    file,
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

export function normalizeArabic(value = "") {
  return String(value)
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/\u0640/gu, "")
    .replace(/[أإآٱ]/gu, "ا")
    .replace(/ؤ/gu, "و")
    .replace(/ئ/gu, "ي")
    .replace(/ى/gu, "ي")
    .replace(/ة/gu, "ه")
    .replace(/[ـ]/gu, "")
    .replace(/[^\p{L}\p{N}\s:_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeLoose(value = "") {
  return normalizeArabic(value)
    .replace(/[\s:_-]+/gu, "");
}

export function slugify(value = "") {
  const normalized = normalizeArabic(value);

  return normalized
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

export function normalizeLevel(value) {
  const candidate = String(value ?? "")
    .trim()
    .toUpperCase();

  return BAYAN_LEVELS.includes(candidate)
    ? candidate
    : null;
}

export function resolveItemLevel(item) {
  const explicit = normalizeLevel(item.level);

  if (explicit) {
    return explicit;
  }

  if (
    item.type === "framework-level" ||
    item.collection?.includes("proficiency")
  ) {
    return normalizeLevel(item.id);
  }

  const candidates = [
    item.id,
    item.sourceId,
    item.collection,
    item.searchableText,
  ];

  for (const candidate of candidates) {
    const match = String(candidate ?? "")
      .toUpperCase()
      .match(/(?:^|[^A-Z0-9])(A0|A1|A2|B1|B2)(?:$|[^A-Z0-9])/);

    if (match) {
      return match[1];
    }
  }

  return null;
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
  const resolvedLevel = resolveItemLevel(item);
  const levelSegment = (
    resolvedLevel ?? "global"
  ).toLowerCase();

  const stableSourceId = String(
    item.id ??
    item.sourceId ??
    shortHash(JSON.stringify(item)),
  );

  return `${prefix}:${levelSegment}:${stableSourceId}`;
}

export function makeEdgeId(from, type, to) {
  return `edge:${shortHash(`${from}|${type}|${to}`)}`;
}

export function normalizeStringArray(values) {
  return [
    ...new Set(
      (values ?? [])
        .flat()
        .filter(
          (value) => typeof value === "string",
        )
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

const topicStopWords = new Set([
  "arabic",
  "english",
  "العربية",
  "اللغة",
  "تعلم",
  "learning",
  "beginner",
  "elementary",
  "intermediate",
  "advanced",
  "a0",
  "a1",
  "a2",
  "b1",
  "b2",
]);

export function extractTopics(item) {
  const candidates = normalizeStringArray([
    item.topic,
    item.theme,
    item.domain,
    item.situation,
    item.context,
    item.category,
    ...(item.topics ?? []),
    ...(item.tags ?? []),
  ]);

  return candidates.filter((topic) => {
    const normalized = normalizeArabic(topic);

    return (
      normalized.length >= 2 &&
      !topicStopWords.has(normalized)
    );
  });
}

export function getNodeLabel(item) {
  return (
    item.arabic ??
    item.word ??
    item.expression ??
    item.titleAr ??
    item.nameAr ??
    item.objectiveAr ??
    item.promptAr ??
    item.questionAr ??
    item.id
  );
}

export function getNodeLabelEn(item) {
  return (
    item.translationEn ??
    item.english ??
    item.titleEn ??
    item.nameEn ??
    item.objectiveEn ??
    null
  );
}

export function collectSearchableValues(value, depth = 0) {
  if (depth > 4 || value == null) {
    return [];
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) =>
      collectSearchableValues(entry, depth + 1),
    );
  }

  if (typeof value === "object") {
    return Object.entries(value).flatMap(
      ([key, entry]) => {
        if (
          [
            "license",
            "source",
            "collection",
            "generatedAt",
          ].includes(key)
        ) {
          return [];
        }

        return collectSearchableValues(
          entry,
          depth + 1,
        );
      },
    );
  }

  return [];
}

export function createSearchDocument(item) {
  const values = normalizeStringArray([
    item.id,
    item.type,
    item.level,
    item.searchableText,
    getNodeLabel(item),
    getNodeLabelEn(item),
    ...extractTopics(item),
    ...collectSearchableValues(item),
  ]);

  return values.join(" ");
}

export function tokenize(value = "") {
  return [
    ...new Set(
      normalizeArabic(value)
        .split(/[\s:_-]+/gu)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2),
    ),
  ];
}

export function tokenSimilarity(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (
    leftTokens.size === 0 ||
    rightTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  if (intersection === 0) {
    return 0;
  }

  const union = new Set([
    ...leftTokens,
    ...rightTokens,
  ]).size;

  return intersection / union;
}

export function sharedTokens(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  return [...leftTokens].filter((token) =>
    rightTokens.has(token),
  );
}

export function createEdge({
  from,
  to,
  type,
  weight = 1,
  confidence,
  origin = "generated",
  evidence = [],
  status = "active",
  metadata = {},
}) {
  const resolvedConfidence =
    typeof confidence === "number"
      ? confidence
      : weight;

  return {
    id: makeEdgeId(from, type, to),
    from,
    to,
    type,
    weight: Number(
      Math.max(0, Math.min(1, weight)).toFixed(4),
    ),
    confidence: Number(
      Math.max(
        0,
        Math.min(1, resolvedConfidence),
      ).toFixed(4),
    ),
    origin,
    evidence: normalizeStringArray(evidence),
    status,
    metadata,
  };
}

export function uniqueById(items) {
  const map = new Map();

  for (const item of items) {
    const existing = map.get(item.id);

    if (!existing) {
      map.set(item.id, item);
      continue;
    }

    if (
      (item.confidence ?? item.weight ?? 0) >
      (existing.confidence ??
        existing.weight ??
        0)
    ) {
      map.set(item.id, item);
    }
  }

  return [...map.values()];
}
