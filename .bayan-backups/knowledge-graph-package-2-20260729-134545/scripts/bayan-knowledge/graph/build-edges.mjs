import path from "node:path";
import {
  createEdge,
  graphRoot,
  readJson,
  uniqueById,
  writeJson,
} from "./lib.mjs";

const nodeRegistry = readJson(
  path.join(graphRoot, "generated/nodes/nodes.json"),
);

const manualEdgesFile = path.join(
  graphRoot,
  "manual/edges.json",
);

const manualEdges = readJson(manualEdgesFile);
const nodes = nodeRegistry.nodes;

const edges = [];

const levelNodes = new Map(
  nodes
    .filter((node) => node.type === "framework-level")
    .map((node) => [node.level, node]),
);

for (const node of nodes) {
  if (
    node.type !== "framework-level" &&
    node.level &&
    levelNodes.has(node.level)
  ) {
    const levelNode = levelNodes.get(node.level);

    edges.push(
      createEdge({
        from: node.graphId,
        to: levelNode.graphId,
        type: "BELONGS_TO_LEVEL",
        weight: 1,
        evidence: [`level:${node.level}`],
      }),
    );
  }
}

const orderedLevels = ["A0", "A1", "A2", "B1", "B2"];

for (let index = 0; index < orderedLevels.length - 1; index += 1) {
  const current = levelNodes.get(orderedLevels[index]);
  const next = levelNodes.get(orderedLevels[index + 1]);

  if (!current || !next) {
    continue;
  }

  edges.push(
    createEdge({
      from: current.graphId,
      to: next.graphId,
      type: "NEXT_LEVEL",
      weight: 1,
      evidence: ["bayan-proficiency-sequence"],
    }),
  );

  edges.push(
    createEdge({
      from: next.graphId,
      to: current.graphId,
      type: "PREVIOUS_LEVEL",
      weight: 1,
      evidence: ["bayan-proficiency-sequence"],
    }),
  );

  edges.push(
    createEdge({
      from: current.graphId,
      to: next.graphId,
      type: "PREREQUISITE_OF",
      weight: 1,
      evidence: ["bayan-proficiency-sequence"],
    }),
  );

  edges.push(
    createEdge({
      from: next.graphId,
      to: current.graphId,
      type: "HAS_PREREQUISITE",
      weight: 1,
      evidence: ["bayan-proficiency-sequence"],
    }),
  );
}

const topicNodes = [];
const topicNodeMap = new Map();

for (const node of nodes) {
  for (const topic of node.topics ?? []) {
    const normalizedTopic = topic
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    if (!normalizedTopic) {
      continue;
    }

    const topicId = `topic:global:${normalizedTopic}`;

    if (!topicNodeMap.has(topicId)) {
      const topicNode = {
        graphId: topicId,
        sourceId: normalizedTopic,
        type: "topic",
        level: null,
        label: topic,
        labelEn: topic,
        sourceCollection: "graph/generated/topics",
        status: "active",
        topics: [],
        searchableText: topic,
        metadata: {
          generated: true,
        },
      };

      topicNodeMap.set(topicId, topicNode);
      topicNodes.push(topicNode);
    }

    edges.push(
      createEdge({
        from: node.graphId,
        to: topicId,
        type: "RELATED_TO_TOPIC",
        weight: 1,
        evidence: [`topic:${topic}`],
      }),
    );
  }
}

for (const edge of manualEdges) {
  edges.push({
    ...edge,
    origin: edge.origin ?? "manual",
    status: edge.status ?? "active",
    weight: edge.weight ?? 1,
    evidence: edge.evidence ?? [],
  });
}

const allNodes = [...nodes, ...topicNodes];

writeJson(
  path.join(graphRoot, "generated/nodes/nodes.json"),
  {
    ...nodeRegistry,
    generatedAt: new Date().toISOString(),
    totalNodes: allNodes.length,
    baseNodeCount: nodes.length,
    generatedTopicCount: topicNodes.length,
    nodes: allNodes,
  },
);

const uniqueEdges = uniqueById(edges);

writeJson(
  path.join(graphRoot, "generated/edges/edges.json"),
  {
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
    totalEdges: uniqueEdges.length,
    edges: uniqueEdges,
  },
);

console.log("✓ Graph edges built");
console.log(`  generated topics: ${topicNodes.length}`);
console.log(`  edges: ${uniqueEdges.length}`);
