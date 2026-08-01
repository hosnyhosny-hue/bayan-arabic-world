import path from "node:path";
import {
  graphRoot,
  readJson,
  writeJson,
} from "./lib.mjs";

const nodeDefinitions = readJson(
  path.join(graphRoot, "definitions/node-types.json"),
);

const edgeDefinitions = readJson(
  path.join(graphRoot, "definitions/edge-types.json"),
);

const nodeRegistry = readJson(
  path.join(graphRoot, "generated/nodes/nodes.json"),
);

const edgeRegistry = readJson(
  path.join(graphRoot, "generated/edges/edges.json"),
);

const allowedNodeTypes = new Set(
  nodeDefinitions.nodeTypes.map((type) => type.id),
);

const allowedEdgeTypes = new Set(
  edgeDefinitions.edgeTypes.map((type) => type.id),
);

const allowedLevels = new Set([
  "A0",
  "A1",
  "A2",
  "B1",
  "B2",
  null,
]);

const errors = [];
const warnings = [];

const nodeIds = new Set();
const edgeIds = new Set();

for (const node of nodeRegistry.nodes) {
  if (!node.graphId) {
    errors.push("Node missing graphId.");
    continue;
  }

  if (nodeIds.has(node.graphId)) {
    errors.push(`Duplicate node graphId: ${node.graphId}`);
  }

  nodeIds.add(node.graphId);

  if (!allowedNodeTypes.has(node.type)) {
    errors.push(
      `${node.graphId}: unsupported node type "${node.type}".`,
    );
  }

  if (!allowedLevels.has(node.level)) {
    errors.push(
      `${node.graphId}: unsupported level "${node.level}".`,
    );
  }

  if (!node.label) {
    errors.push(`${node.graphId}: missing label.`);
  }

  if (!node.sourceCollection) {
    errors.push(`${node.graphId}: missing sourceCollection.`);
  }
}

for (const edge of edgeRegistry.edges) {
  if (!edge.id) {
    errors.push("Edge missing id.");
    continue;
  }

  if (edgeIds.has(edge.id)) {
    errors.push(`Duplicate edge id: ${edge.id}`);
  }

  edgeIds.add(edge.id);

  if (!nodeIds.has(edge.from)) {
    errors.push(
      `${edge.id}: source node does not exist: ${edge.from}`,
    );
  }

  if (!nodeIds.has(edge.to)) {
    errors.push(
      `${edge.id}: target node does not exist: ${edge.to}`,
    );
  }

  if (!allowedEdgeTypes.has(edge.type)) {
    errors.push(
      `${edge.id}: unsupported edge type "${edge.type}".`,
    );
  }

  if (
    typeof edge.weight !== "number" ||
    edge.weight < 0 ||
    edge.weight > 1
  ) {
    errors.push(
      `${edge.id}: weight must be between 0 and 1.`,
    );
  }

  if (edge.from === edge.to) {
    warnings.push(`${edge.id}: self-referencing edge.`);
  }
}

const connectedNodeIds = new Set();

for (const edge of edgeRegistry.edges) {
  connectedNodeIds.add(edge.from);
  connectedNodeIds.add(edge.to);
}

const orphanNodes = nodeRegistry.nodes
  .filter((node) => !connectedNodeIds.has(node.graphId))
  .map((node) => node.graphId);

for (const orphan of orphanNodes) {
  warnings.push(`${orphan}: orphan node.`);
}

const report = {
  generatedAt: new Date().toISOString(),
  valid: errors.length === 0,
  nodeCount: nodeRegistry.nodes.length,
  edgeCount: edgeRegistry.edges.length,
  orphanNodeCount: orphanNodes.length,
  errors,
  warnings,
};

writeJson(
  path.join(graphRoot, "reports/validation-report.json"),
  report,
);

if (errors.length > 0) {
  console.error("✗ BAYAN Knowledge Graph validation failed");

  for (const error of errors) {
    console.error(`  ✗ ${error}`);
  }

  process.exit(1);
}

console.log("✓ BAYAN Knowledge Graph validation passed");
console.log(`  nodes: ${report.nodeCount}`);
console.log(`  edges: ${report.edgeCount}`);
console.log(`  orphan nodes: ${report.orphanNodeCount}`);
console.log(`  warnings: ${report.warnings.length}`);
