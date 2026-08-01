import "server-only";

import fs from "node:fs";
import path from "node:path";

import type {
  DailyMission,
  GraphEdge,
  GraphExperiencePayload,
  GraphNode,
  GraphStatistics,
  LearningLevel,
} from "./graph-types";

const LEVEL_ORDER = ["A0", "A1", "A2", "B1", "B2"] as const;

const LEVEL_CONTENT: Record<
  string,
  {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
  }
> = {
  A0: {
    titleAr: "التمهيدي",
    titleEn: "Foundation",
    descriptionAr: "التحيات والأصوات والكلمات الأولى.",
    descriptionEn: "Greetings, sounds and first words.",
  },
  A1: {
    titleAr: "المبتدئ",
    titleEn: "Beginner",
    descriptionAr: "التواصل في المواقف اليومية البسيطة.",
    descriptionEn: "Communicate in simple everyday situations.",
  },
  A2: {
    titleAr: "الأساسي",
    titleEn: "Elementary",
    descriptionAr: "بناء جمل أطول والتفاعل بثقة أكبر.",
    descriptionEn: "Build longer sentences and interact confidently.",
  },
  B1: {
    titleAr: "المتوسط",
    titleEn: "Intermediate",
    descriptionAr: "التعبير عن الأفكار والخبرات والآراء.",
    descriptionEn: "Express ideas, experiences and opinions.",
  },
  B2: {
    titleAr: "فوق المتوسط",
    titleEn: "Upper Intermediate",
    descriptionAr: "تواصل مستقل ودقيق في سياقات متنوعة.",
    descriptionEn: "Independent, accurate communication in varied contexts.",
  },
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function countBy<T>(
  values: T[],
  selector: (value: T) => string,
): Record<string, number> {
  return values.reduce<Record<string, number>>((result, value) => {
    const key = selector(value);
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});
}

function resolveCurrentLevel(nodes: GraphNode[]): string {
  const preferred = process.env.BAYAN_ARABIC_B_CURRENT_LEVEL?.toUpperCase();

  if (preferred && LEVEL_ORDER.includes(preferred as (typeof LEVEL_ORDER)[number])) {
    return preferred;
  }

  return nodes.some((node) => node.level === "A1") ? "A1" : "A0";
}

function createLevels(
  nodes: GraphNode[],
  currentLevel: string,
): LearningLevel[] {
  const currentIndex = LEVEL_ORDER.indexOf(
    currentLevel as (typeof LEVEL_ORDER)[number],
  );

  return LEVEL_ORDER.map((level, index) => {
    const metadata = LEVEL_CONTENT[level];
    const nodeCount = nodes.filter((node) => node.level === level).length;

    let progress = 0;

    if (index < currentIndex) {
      progress = 100;
    } else if (index === currentIndex) {
      progress = level === "A1" ? 42 : 28;
    }

    return {
      id: level,
      ...metadata,
      nodeCount,
      progress,
      isCurrent: index === currentIndex,
      isLocked: index > currentIndex + 1,
    };
  });
}

function createDailyMission(
  nodes: GraphNode[],
  currentLevel: string,
): DailyMission {
  const preferredDialogue = nodes.find(
    (node) =>
      node.type === "dialogue" &&
      node.level === currentLevel &&
      /مقهى|café|cafe/iu.test(
        `${node.label} ${node.labelEn ?? ""} ${node.searchableText ?? ""}`,
      ),
  );

  const dialogue =
    preferredDialogue ??
    nodes.find(
      (node) =>
        node.type === "dialogue" &&
        node.level === currentLevel,
    ) ??
    nodes.find((node) => node.type === "dialogue");

  if (dialogue) {
    return {
      id: `mission:${dialogue.graphId}`,
      titleAr: `تحدث في: ${dialogue.label}`,
      titleEn: dialogue.labelEn
        ? `Speak: ${dialogue.labelEn}`
        : "Complete a real-life conversation",
      descriptionAr:
        "استمع إلى الحوار، اكتشف مفرداته، ثم أعد بناءه بصوتك.",
      descriptionEn:
        "Listen, discover the connected vocabulary, then rebuild the conversation.",
      nodeId: dialogue.graphId,
      rewardXp: 80,
      durationMinutes: 8,
    };
  }

  return {
    id: "mission:explore",
    titleAr: "اكتشف كلمة جديدة",
    titleEn: "Discover a new word",
    descriptionAr:
      "استكشف الكلمة ومعناها والمهارات والتقييمات المرتبطة بها.",
    descriptionEn:
      "Explore a word, its meaning, skills and connected assessments.",
    nodeId: nodes.find((node) => node.type === "vocabulary")?.graphId ?? null,
    rewardXp: 50,
    durationMinutes: 5,
  };
}

export function getGraphExperience(): GraphExperiencePayload {
  const graphRoot = path.join(
    process.cwd(),
    "app/learn/arabic-b/knowledge/core/graph",
  );

  const nodesRegistry = readJson<{
    generatedAt?: string;
    version?: string;
    nodes: GraphNode[];
  }>(
    path.join(graphRoot, "generated/nodes/nodes.json"),
  );

  const edgesRegistry = readJson<{
    generatedAt?: string;
    version?: string;
    edges: GraphEdge[];
  }>(
    path.join(graphRoot, "generated/edges/edges.json"),
  );

  const nodes = nodesRegistry.nodes;
  const edges = edgesRegistry.edges;
  const connectedNodeIds = new Set<string>();

  for (const edge of edges) {
    connectedNodeIds.add(edge.from);
    connectedNodeIds.add(edge.to);
  }

  const statistics: GraphStatistics = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    orphanCount: nodes.filter(
      (node) => !connectedNodeIds.has(node.graphId),
    ).length,
    nodesByType: countBy(nodes, (node) => node.type),
    nodesByLevel: countBy(
      nodes,
      (node) => node.level ?? "GLOBAL",
    ),
    edgesByType: countBy(edges, (edge) => edge.type),
  };

  const currentLevel = resolveCurrentLevel(nodes);

  const featuredNodeIds = [
    nodes.find(
      (node) =>
        node.type === "vocabulary" &&
        /أُ?رِ?ي?د|اريد/iu.test(
          `${node.label} ${node.normalizedLabel ?? ""}`,
        ),
    )?.graphId,
    nodes.find(
      (node) =>
        node.type === "dialogue" &&
        node.level === currentLevel,
    )?.graphId,
    nodes.find(
      (node) =>
        node.type === "grammar" &&
        node.level === currentLevel,
    )?.graphId,
    nodes.find(
      (node) =>
        node.type === "skill" &&
        node.level === currentLevel,
    )?.graphId,
  ].filter((value): value is string => Boolean(value));

  return {
    generatedAt:
      nodesRegistry.generatedAt ??
      edgesRegistry.generatedAt ??
      new Date().toISOString(),
    version: nodesRegistry.version ?? "2.0.0",
    nodes,
    edges,
    statistics,
    levels: createLevels(nodes, currentLevel),
    dailyMission: createDailyMission(nodes, currentLevel),
    featuredNodeIds: [...new Set(featuredNodeIds)],
    currentLevel,
  };
}
