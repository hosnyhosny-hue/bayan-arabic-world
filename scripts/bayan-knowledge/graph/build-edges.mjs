import path from "node:path";
import {
  BAYAN_LEVELS,
  createEdge,
  graphRoot,
  normalizeArabic,
  normalizeStringArray,
  readJson,
  sharedTokens,
  tokenSimilarity,
  uniqueById,
  writeJson,
} from "./lib.mjs";

const nodeRegistry = readJson(
  path.join(
    graphRoot,
    "generated/nodes/nodes.json",
  ),
);

const manualEdgesFile = path.join(
  graphRoot,
  "manual/edges.json",
);

const manualEdges = readJson(manualEdgesFile);
const baseNodes = nodeRegistry.nodes;
const edges = [];

function nodeText(node) {
  return [
    node.label,
    node.labelEn,
    node.searchableText,
    node.normalizedSearchText,
    ...(node.topics ?? []),
    ...(node.searchTokens ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function semanticScore(left, right) {
  const textScore = tokenSimilarity(
    nodeText(left),
    nodeText(right),
  );

  const leftTopics = new Set(
    (left.topics ?? []).map(normalizeArabic),
  );

  const rightTopics = new Set(
    (right.topics ?? []).map(normalizeArabic),
  );

  let sharedTopicCount = 0;

  for (const topic of leftTopics) {
    if (rightTopics.has(topic)) {
      sharedTopicCount += 1;
    }
  }

  const topicScore =
    sharedTopicCount > 0
      ? Math.min(
          1,
          0.7 +
            sharedTopicCount * 0.1,
        )
      : 0;

  const levelBonus =
    left.level &&
    right.level &&
    left.level === right.level
      ? 0.15
      : 0;

  return Math.min(
    1,
    Math.max(textScore, topicScore) +
      levelBonus,
  );
}

function evidenceFor(left, right) {
  const tokens = sharedTokens(
    nodeText(left),
    nodeText(right),
  ).slice(0, 8);

  const commonTopics = (
    left.topics ?? []
  ).filter((topic) =>
    (right.topics ?? [])
      .map(normalizeArabic)
      .includes(normalizeArabic(topic)),
  );

  return normalizeStringArray([
    left.level === right.level &&
    left.level
      ? `same-level:${left.level}`
      : null,
    ...tokens.map(
      (token) => `shared-token:${token}`,
    ),
    ...commonTopics.map(
      (topic) => `shared-topic:${topic}`,
    ),
  ]);
}

function addBidirectional({
  left,
  right,
  forwardType,
  reverseType,
  score,
  evidence,
}) {
  edges.push(
    createEdge({
      from: left.graphId,
      to: right.graphId,
      type: forwardType,
      weight: score,
      confidence: score,
      evidence,
      metadata: {
        generatedBy:
          "semantic-relations-v2",
      },
    }),
  );

  if (reverseType) {
    edges.push(
      createEdge({
        from: right.graphId,
        to: left.graphId,
        type: reverseType,
        weight: score,
        confidence: score,
        evidence,
        metadata: {
          generatedBy:
            "semantic-relations-v2",
        },
      }),
    );
  }
}

/*
 * 1. Framework-level relations
 */

const levelNodes = new Map(
  baseNodes
    .filter(
      (node) =>
        node.type === "framework-level" &&
        node.level,
    )
    .map((node) => [node.level, node]),
);

for (const node of baseNodes) {
  if (
    node.type === "framework-level" ||
    !node.level
  ) {
    continue;
  }

  const levelNode =
    levelNodes.get(node.level);

  if (!levelNode) {
    continue;
  }

  edges.push(
    createEdge({
      from: node.graphId,
      to: levelNode.graphId,
      type: "BELONGS_TO_LEVEL",
      weight: 1,
      confidence: 1,
      evidence: [
        `explicit-level:${node.level}`,
      ],
    }),
  );
}

for (
  let index = 0;
  index < BAYAN_LEVELS.length - 1;
  index += 1
) {
  const current =
    levelNodes.get(BAYAN_LEVELS[index]);

  const next =
    levelNodes.get(BAYAN_LEVELS[index + 1]);

  if (!current || !next) {
    continue;
  }

  edges.push(
    createEdge({
      from: current.graphId,
      to: next.graphId,
      type: "NEXT_LEVEL",
      weight: 1,
      confidence: 1,
      evidence: [
        "bayan-proficiency-sequence",
      ],
    }),
  );

  edges.push(
    createEdge({
      from: next.graphId,
      to: current.graphId,
      type: "PREVIOUS_LEVEL",
      weight: 1,
      confidence: 1,
      evidence: [
        "bayan-proficiency-sequence",
      ],
    }),
  );

  edges.push(
    createEdge({
      from: current.graphId,
      to: next.graphId,
      type: "PREREQUISITE_OF",
      weight: 1,
      confidence: 1,
      evidence: [
        "bayan-proficiency-sequence",
      ],
    }),
  );

  edges.push(
    createEdge({
      from: next.graphId,
      to: current.graphId,
      type: "HAS_PREREQUISITE",
      weight: 1,
      confidence: 1,
      evidence: [
        "bayan-proficiency-sequence",
      ],
    }),
  );
}

/*
 * 2. Canonical topic nodes
 */

const topicNodes = [];
const topicNodeMap = new Map();

for (const node of baseNodes) {
  for (const topic of node.topics ?? []) {
    const canonical =
      normalizeArabic(topic)
        .replace(/\s+/gu, "-")
        .replace(/[^\p{L}\p{N}-]/gu, "");

    if (
      !canonical ||
      canonical.length < 2
    ) {
      continue;
    }

    const topicId =
      `topic:global:${canonical}`;

    if (!topicNodeMap.has(topicId)) {
      const topicNode = {
        graphId: topicId,
        sourceId: canonical,
        type: "topic",
        level: null,
        label: topic,
        labelEn: null,
        sourceCollection:
          "graph/generated/topics",
        status: "active",
        topics: [],
        searchableText: topic,
        normalizedLabel:
          normalizeArabic(topic),
        normalizedLabelLoose:
          normalizeArabic(topic)
            .replace(/\s+/gu, ""),
        normalizedSearchText:
          normalizeArabic(topic),
        searchTokens: [
          normalizeArabic(topic),
        ],
        metadata: {
          generated: true,
          canonicalTopic: canonical,
        },
      };

      topicNodeMap.set(
        topicId,
        topicNode,
      );

      topicNodes.push(topicNode);
    }

    edges.push(
      createEdge({
        from: node.graphId,
        to: topicId,
        type: "RELATED_TO_TOPIC",
        weight: 1,
        confidence: 1,
        evidence: [
          `explicit-topic:${topic}`,
        ],
      }),
    );
  }
}

/*
 * 3. Vocabulary ↔ dialogue
 */

const vocabularyNodes = baseNodes.filter(
  (node) => node.type === "vocabulary",
);

const dialogueNodes = baseNodes.filter(
  (node) => node.type === "dialogue",
);

for (const dialogue of dialogueNodes) {
  const ranked = vocabularyNodes
    .filter(
      (vocabulary) =>
        !dialogue.level ||
        !vocabulary.level ||
        dialogue.level === vocabulary.level,
    )
    .map((vocabulary) => ({
      node: vocabulary,
      score: semanticScore(
        dialogue,
        vocabulary,
      ),
    }))
    .filter(({ score }) => score >= 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  for (const candidate of ranked) {
    const score = Math.max(
      0.55,
      candidate.score,
    );

    addBidirectional({
      left: dialogue,
      right: candidate.node,
      forwardType: "USES_VOCABULARY",
      reverseType: "USED_IN",
      score,
      evidence: evidenceFor(
        dialogue,
        candidate.node,
      ),
    });
  }
}

/*
 * 4. Dialogue ↔ grammar
 */

const grammarNodes = baseNodes.filter(
  (node) => node.type === "grammar",
);

for (const dialogue of dialogueNodes) {
  let ranked = grammarNodes
    .filter(
      (grammar) =>
        !dialogue.level ||
        !grammar.level ||
        dialogue.level === grammar.level,
    )
    .map((grammar) => ({
      node: grammar,
      score: semanticScore(
        dialogue,
        grammar,
      ),
    }))
    .filter(({ score }) => score >= 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (ranked.length === 0) {
    ranked = grammarNodes
      .filter(
        (grammar) =>
          dialogue.level &&
          grammar.level === dialogue.level,
      )
      .slice(0, 1)
      .map((grammar) => ({
        node: grammar,
        score: 0.5,
      }));
  }

  for (const candidate of ranked) {
    const score = Math.max(
      0.5,
      candidate.score,
    );

    addBidirectional({
      left: dialogue,
      right: candidate.node,
      forwardType: "PRACTICES_GRAMMAR",
      reverseType: "PRACTICED_IN",
      score,
      evidence: evidenceFor(
        dialogue,
        candidate.node,
      ),
    });
  }
}

/*
 * 5. Learning objects ↔ skills
 */

const skillNodes = baseNodes.filter(
  (node) => node.type === "skill",
);

const skillTargets = baseNodes.filter(
  (node) =>
    [
      "dialogue",
      "vocabulary",
      "grammar",
      "culture",
    ].includes(node.type),
);

for (const target of skillTargets) {
  let ranked = skillNodes
    .filter(
      (skill) =>
        !target.level ||
        !skill.level ||
        target.level === skill.level,
    )
    .map((skill) => ({
      node: skill,
      score: semanticScore(
        target,
        skill,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const meaningful = ranked.filter(
    ({ score }) => score >= 0.12,
  );

  ranked =
    meaningful.length > 0
      ? meaningful.slice(0, 2)
      : ranked.slice(0, 1);

  for (const candidate of ranked) {
    const score = Math.max(
      0.5,
      candidate.score,
    );

    addBidirectional({
      left: target,
      right: candidate.node,
      forwardType: "ALIGNS_WITH_SKILL",
      reverseType: "DEVELOPED_BY",
      score,
      evidence: evidenceFor(
        target,
        candidate.node,
      ),
    });
  }
}

/*
 * 6. Assessments ↔ knowledge objects
 */

const assessmentNodes = baseNodes.filter(
  (node) => node.type === "assessment",
);

const assessableNodes = baseNodes.filter(
  (node) =>
    [
      "vocabulary",
      "grammar",
      "skill",
      "dialogue",
      "culture",
    ].includes(node.type),
);

for (const assessment of assessmentNodes) {
  let ranked = assessableNodes
    .filter(
      (candidate) =>
        !assessment.level ||
        !candidate.level ||
        assessment.level === candidate.level,
    )
    .map((candidate) => ({
      node: candidate,
      score: semanticScore(
        assessment,
        candidate,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const meaningful = ranked.filter(
    ({ score }) => score >= 0.12,
  );

  ranked =
    meaningful.length > 0
      ? meaningful.slice(0, 6)
      : ranked.slice(0, 3);

  for (const candidate of ranked) {
    const score = Math.max(
      0.48,
      candidate.score,
    );

    addBidirectional({
      left: candidate.node,
      right: assessment,
      forwardType: "ASSESSED_BY",
      reverseType: "ASSESSES",
      score,
      evidence: evidenceFor(
        assessment,
        candidate.node,
      ),
    });
  }
}

/*
 * 7. Grammar progression
 */

for (const grammar of grammarNodes) {
  const currentLevelIndex =
    BAYAN_LEVELS.indexOf(grammar.level);

  if (currentLevelIndex <= 0) {
    continue;
  }

  const previousLevel =
    BAYAN_LEVELS[currentLevelIndex - 1];

  const candidates = grammarNodes
    .filter(
      (candidate) =>
        candidate.level === previousLevel,
    )
    .map((candidate) => ({
      node: candidate,
      score: semanticScore(
        grammar,
        candidate,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const prerequisite = candidates[0];

  if (!prerequisite) {
    continue;
  }

  const score = Math.max(
    0.45,
    prerequisite.score,
  );

  addBidirectional({
    left: prerequisite.node,
    right: grammar,
    forwardType: "PREREQUISITE_OF",
    reverseType: "HAS_PREREQUISITE",
    score,
    evidence: [
      `previous-level:${previousLevel}`,
      ...evidenceFor(
        prerequisite.node,
        grammar,
      ),
    ],
  });
}

/*
 * 8. Manual curated edges
 */

for (const edge of manualEdges) {
  if (!edge.from || !edge.to || !edge.type) {
    continue;
  }

  edges.push({
    ...edge,
    id:
      edge.id ??
      createEdge({
        from: edge.from,
        to: edge.to,
        type: edge.type,
      }).id,
    origin: edge.origin ?? "manual",
    status: edge.status ?? "active",
    weight: edge.weight ?? 1,
    confidence:
      edge.confidence ??
      edge.weight ??
      1,
    evidence: edge.evidence ?? [],
  });
}

const allNodes = [
  ...baseNodes,
  ...topicNodes,
];

const uniqueEdges = uniqueById(edges);

writeJson(
  path.join(
    graphRoot,
    "generated/nodes/nodes.json",
  ),
  {
    ...nodeRegistry,
    generatedAt: new Date().toISOString(),
    version: "2.0.0",
    totalNodes: allNodes.length,
    baseNodeCount: baseNodes.length,
    generatedTopicCount:
      topicNodes.length,
    nodes: allNodes,
  },
);

writeJson(
  path.join(
    graphRoot,
    "generated/edges/edges.json",
  ),
  {
    generatedAt: new Date().toISOString(),
    version: "2.0.0",
    totalEdges: uniqueEdges.length,
    edges: uniqueEdges,
  },
);

const relationshipCounts = {};

for (const edge of uniqueEdges) {
  relationshipCounts[edge.type] =
    (relationshipCounts[edge.type] ?? 0) +
    1;
}

writeJson(
  path.join(
    graphRoot,
    "reports/semantic-relations-report.json",
  ),
  {
    generatedAt: new Date().toISOString(),
    version: "2.0.0",
    nodes: allNodes.length,
    edges: uniqueEdges.length,
    generatedTopics: topicNodes.length,
    relationships: relationshipCounts,
    methodology: {
      levelAlignment: true,
      topicMatching: true,
      normalizedArabicMatching: true,
      tokenSimilarity: true,
      confidenceScores: true,
      humanReviewRecommended:
        "Relations below 0.7 should be reviewed as the content library grows."
    }
  },
);

console.log("✓ Semantic relations built");
console.log(
  `  generated topics: ${topicNodes.length}`,
);
console.log(
  `  total edges: ${uniqueEdges.length}`,
);

for (
  const [type, count]
  of Object.entries(relationshipCounts)
) {
  console.log(`  ${type}: ${count}`);
}
