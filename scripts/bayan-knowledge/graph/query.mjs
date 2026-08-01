import path from "node:path";
import {
  graphRoot,
  normalizeArabic,
  normalizeLoose,
  readJson,
  tokenSimilarity,
} from "./lib.mjs";

const index = readJson(
  path.join(
    graphRoot,
    "generated/indexes/graph-index.json",
  ),
);

const [, , command, ...args] = process.argv;

function nodeSearchScore(node, query) {
  const normalizedQuery =
    normalizeArabic(query);

  const looseQuery =
    normalizeLoose(query);

  if (!normalizedQuery) {
    return 0;
  }

  const graphId =
    normalizeArabic(node.graphId);

  const sourceId =
    normalizeArabic(node.sourceId);

  const label =
    node.normalizedLabel ??
    normalizeArabic(node.label);

  const looseLabel =
    node.normalizedLabelLoose ??
    normalizeLoose(node.label);

  const labelEn =
    normalizeArabic(node.labelEn ?? "");

  const searchText =
    node.normalizedSearchText ??
    normalizeArabic(
      node.searchableText ?? "",
    );

  if (
    graphId === normalizedQuery ||
    sourceId === normalizedQuery
  ) {
    return 1;
  }

  if (
    label === normalizedQuery ||
    looseLabel === looseQuery
  ) {
    return 0.99;
  }

  if (
    label.startsWith(normalizedQuery) ||
    looseLabel.startsWith(looseQuery)
  ) {
    return 0.94;
  }

  if (
    label.includes(normalizedQuery) ||
    looseLabel.includes(looseQuery)
  ) {
    return 0.9;
  }

  if (
    labelEn.includes(normalizedQuery)
  ) {
    return 0.85;
  }

  if (
    searchText.includes(normalizedQuery)
  ) {
    return 0.8;
  }

  const similarity = tokenSimilarity(
    searchText,
    normalizedQuery,
  );

  return similarity > 0
    ? Math.min(0.79, similarity + 0.35)
    : 0;
}

function searchNodes(query, limit = 20) {
  return Object.values(index.nodesById)
    .map((node) => ({
      node,
      score: nodeSearchScore(
        node,
        query,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.node.graphId.localeCompare(
        right.node.graphId,
      );
    })
    .slice(0, limit);
}

function findNode(query) {
  return searchNodes(query, 1)[0]?.node;
}

function getEdges(ids = []) {
  return ids
    .map((id) => index.edgeById[id])
    .filter(Boolean);
}

function summarizeNode(node) {
  return {
    graphId: node.graphId,
    sourceId: node.sourceId,
    type: node.type,
    level: node.level,
    label: node.label,
    labelEn: node.labelEn,
    topics: node.topics,
  };
}

switch (command) {
  case "node": {
    const query = args.join(" ");
    const result = searchNodes(query, 1)[0];

    if (!result) {
      console.error(
        `Node not found: ${query}`,
      );
      process.exitCode = 1;
      break;
    }

    console.log(
      JSON.stringify(
        {
          score: result.score,
          node: result.node,
        },
        null,
        2,
      ),
    );

    break;
  }

  case "search": {
    const query = args.join(" ");

    const results = searchNodes(
      query,
      20,
    ).map(({ node, score }) => ({
      score,
      ...summarizeNode(node),
    }));

    console.log(
      JSON.stringify(results, null, 2),
    );

    break;
  }

  case "neighbors": {
    const query = args.join(" ");
    const result = searchNodes(query, 1)[0];

    if (!result) {
      console.error(
        `Node not found: ${query}`,
      );
      process.exit(1);
    }

    const node = result.node;

    const outgoing = getEdges(
      index.outgoing[node.graphId] ?? [],
    )
      .map((edge) => ({
        direction: "outgoing",
        edge,
        node: index.nodesById[edge.to],
      }))
      .sort(
        (left, right) =>
          (right.edge.confidence ??
            right.edge.weight ??
            0) -
          (left.edge.confidence ??
            left.edge.weight ??
            0),
      );

    const incoming = getEdges(
      index.incoming[node.graphId] ?? [],
    )
      .map((edge) => ({
        direction: "incoming",
        edge,
        node: index.nodesById[edge.from],
      }))
      .sort(
        (left, right) =>
          (right.edge.confidence ??
            right.edge.weight ??
            0) -
          (left.edge.confidence ??
            left.edge.weight ??
            0),
      );

    console.log(
      JSON.stringify(
        {
          query,
          matchScore: result.score,
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

  case "relations": {
    const query = args.join(" ");
    const result = searchNodes(query, 1)[0];

    if (!result) {
      console.error(
        `Node not found: ${query}`,
      );
      process.exit(1);
    }

    const node = result.node;

    const relations = [
      ...getEdges(
        index.outgoing[node.graphId] ?? [],
      ).map((edge) => ({
        direction: "outgoing",
        type: edge.type,
        confidence:
          edge.confidence ?? edge.weight,
        target:
          summarizeNode(
            index.nodesById[edge.to],
          ),
      })),

      ...getEdges(
        index.incoming[node.graphId] ?? [],
      ).map((edge) => ({
        direction: "incoming",
        type: edge.type,
        confidence:
          edge.confidence ?? edge.weight,
        source:
          summarizeNode(
            index.nodesById[edge.from],
          ),
      })),
    ].sort(
      (left, right) =>
        right.confidence -
        left.confidence,
    );

    console.log(
      JSON.stringify(
        {
          node: summarizeNode(node),
          relations,
        },
        null,
        2,
      ),
    );

    break;
  }

  case "type": {
    const type = args[0];

    const nodes = (
      index.nodesByType[type] ?? []
    ).map(
      (id) => index.nodesById[id],
    );

    console.log(
      JSON.stringify(nodes, null, 2),
    );

    break;
  }

  case "level": {
    const level = String(
      args[0] ?? "",
    ).toUpperCase();

    const nodes = (
      index.nodesByLevel[level] ?? []
    ).map(
      (id) => index.nodesById[id],
    );

    console.log(
      JSON.stringify(nodes, null, 2),
    );

    break;
  }

  case "stats": {
    console.log(
      JSON.stringify(
        index.statistics,
        null,
        2,
      ),
    );

    break;
  }

  default: {
    console.log(`
BAYAN Graph Query — Package 2

Commands:

  search <Arabic-or-English-text>
  node <id-or-text>
  neighbors <id-or-text>
  relations <id-or-text>
  type <node-type>
  level <A0|A1|A2|B1|B2>
  stats

Arabic search supports:

  أريد
  أُرِيدُ
  اريد

Examples:

  npm run bayan:graph:query -- search "أريد"
  npm run bayan:graph:query -- node "أُرِيدُ"
  npm run bayan:graph:query -- neighbors "اريد"
  npm run bayan:graph:query -- relations "المطعم"
  npm run bayan:graph:query -- type dialogue
  npm run bayan:graph:query -- level A1
  npm run bayan:graph:query -- stats
`);
  }
}
