import path from "node:path";
import {
  graphRoot,
  readJson,
  writeJson,
} from "./lib.mjs";

const nodeRegistry = readJson(
  path.join(graphRoot, "generated/nodes/nodes.json"),
);

const edgeRegistry = readJson(
  path.join(graphRoot, "generated/edges/edges.json"),
);

const nodes = nodeRegistry.nodes;
const edges = edgeRegistry.edges;

const nodesById = {};
const nodesByType = {};
const nodesByLevel = {};
const outgoing = {};
const incoming = {};
const edgesByType = {};

for (const node of nodes) {
  nodesById[node.graphId] = node;

  nodesByType[node.type] ??= [];
  nodesByType[node.type].push(node.graphId);

  const level = node.level ?? "GLOBAL";
  nodesByLevel[level] ??= [];
  nodesByLevel[level].push(node.graphId);
}

for (const edge of edges) {
  outgoing[edge.from] ??= [];
  outgoing[edge.from].push(edge.id);

  incoming[edge.to] ??= [];
  incoming[edge.to].push(edge.id);

  edgesByType[edge.type] ??= [];
  edgesByType[edge.type].push(edge.id);
}

const edgeById = Object.fromEntries(
  edges.map((edge) => [edge.id, edge]),
);

const statistics = {
  nodeCount: nodes.length,
  edgeCount: edges.length,
  nodesByType: Object.fromEntries(
    Object.entries(nodesByType).map(([type, ids]) => [
      type,
      ids.length,
    ]),
  ),
  nodesByLevel: Object.fromEntries(
    Object.entries(nodesByLevel).map(([level, ids]) => [
      level,
      ids.length,
    ]),
  ),
  edgesByType: Object.fromEntries(
    Object.entries(edgesByType).map(([type, ids]) => [
      type,
      ids.length,
    ]),
  ),
  orphanNodes: nodes
    .filter(
      (node) =>
        !(outgoing[node.graphId]?.length) &&
        !(incoming[node.graphId]?.length),
    )
    .map((node) => node.graphId),
};

const index = {
  generatedAt: new Date().toISOString(),
  version: "1.0.0",
  statistics,
  nodesById,
  edgeById,
  nodesByType,
  nodesByLevel,
  edgesByType,
  outgoing,
  incoming,
};

writeJson(
  path.join(
    graphRoot,
    "generated/indexes/graph-index.json",
  ),
  index,
);

writeJson(
  path.join(graphRoot, "generated/graph.json"),
  {
    generatedAt: index.generatedAt,
    version: index.version,
    statistics,
    nodes,
    edges,
  },
);

console.log("✓ Graph indexes built");
console.log(`  nodes: ${statistics.nodeCount}`);
console.log(`  edges: ${statistics.edgeCount}`);
console.log(`  orphan nodes: ${statistics.orphanNodes.length}`);
