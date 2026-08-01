import path from "node:path";
import {
  graphRoot,
  readJson,
} from "./lib.mjs";

const index = readJson(
  path.join(graphRoot, "generated/indexes/graph-index.json"),
);

const [, , command, ...args] = process.argv;

function printNode(node) {
  if (!node) {
    console.error("Node not found.");
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(node, null, 2));
}

function findNode(query) {
  const exact = index.nodesById[query];

  if (exact) {
    return exact;
  }

  const normalized = query.toLowerCase();

  return Object.values(index.nodesById).find((node) =>
    [
      node.graphId,
      node.sourceId,
      node.label,
      node.labelEn,
      node.searchableText,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(normalized),
      ),
  );
}

function getEdges(ids = []) {
  return ids
    .map((id) => index.edgeById[id])
    .filter(Boolean);
}

switch (command) {
  case "node": {
    printNode(findNode(args.join(" ")));
    break;
  }

  case "neighbors": {
    const query = args.join(" ");
    const node = findNode(query);

    if (!node) {
      console.error(`Node not found: ${query}`);
      process.exit(1);
    }

    const outgoing = getEdges(
      index.outgoing[node.graphId] ?? [],
    ).map((edge) => ({
      direction: "outgoing",
      edge,
      node: index.nodesById[edge.to],
    }));

    const incoming = getEdges(
      index.incoming[node.graphId] ?? [],
    ).map((edge) => ({
      direction: "incoming",
      edge,
      node: index.nodesById[edge.from],
    }));

    console.log(
      JSON.stringify(
        {
          node,
          outgoing,
          incoming,
        },
        null,
        2,
      ),
    );

    break;
  }

  case "type": {
    const type = args[0];

    const nodes = (index.nodesByType[type] ?? [])
      .map((id) => index.nodesById[id]);

    console.log(JSON.stringify(nodes, null, 2));
    break;
  }

  case "level": {
    const level = String(args[0] ?? "").toUpperCase();

    const nodes = (index.nodesByLevel[level] ?? [])
      .map((id) => index.nodesById[id]);

    console.log(JSON.stringify(nodes, null, 2));
    break;
  }

  case "stats": {
    console.log(
      JSON.stringify(index.statistics, null, 2),
    );
    break;
  }

  default: {
    console.log(`
BAYAN Graph Query

Commands:

  node <id-or-text>
  neighbors <id-or-text>
  type <node-type>
  level <A0|A1|A2|B1|B2>
  stats

Examples:

  npm run bayan:graph:query -- node vocab:a1:vocab-a1-002
  npm run bayan:graph:query -- node أريد
  npm run bayan:graph:query -- neighbors أريد
  npm run bayan:graph:query -- type dialogue
  npm run bayan:graph:query -- level A1
  npm run bayan:graph:query -- stats
`);
  }
}
