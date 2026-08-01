import "server-only";

import type {
  GraphExperiencePayload,
  GraphNode,
} from "./graph-types";

import type {
  JourneyMission,
  JourneyPayload,
  JourneyStage,
  JourneyWorld,
  JourneyWorldId,
} from "./journey-types";

type WorldDefinition = {
  id: JourneyWorldId;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: string;
  href: string;
  level: string;
  accent: string;
  keywords: string[];
};

const WORLD_DEFINITIONS: WorldDefinition[] = [
  {
    id: "school",
    titleAr: "المدرسة",
    titleEn: "School",
    subtitleAr: "تعرّف إلى زملائك وابدأ يومك الأول.",
    subtitleEn: "Meet classmates and begin your first day.",
    icon: "🏫",
    href: "/learn/arabic-b/worlds/school",
    level: "A0",
    accent: "blue",
    keywords: ["school", "classroom", "التعارف", "المدرسة", "تحية"],
  },
  {
    id: "canteen",
    titleAr: "المقهى والمطعم",
    titleEn: "Café & Canteen",
    subtitleAr: "اطلب مشروبًا وطعامًا باللغة العربية.",
    subtitleEn: "Order food and drinks in Arabic.",
    icon: "☕",
    href: "/learn/arabic-b/worlds/canteen",
    level: "A1",
    accent: "orange",
    keywords: ["cafe", "café", "food", "drink", "مقهى", "طعام", "أريد"],
  },
  {
    id: "market",
    titleAr: "السوق",
    titleEn: "Market",
    subtitleAr: "اسأل عن الأسعار واختر ما تحتاج إليه.",
    subtitleEn: "Ask about prices and choose what you need.",
    icon: "🛍️",
    href: "/learn/arabic-b/worlds/market",
    level: "A1",
    accent: "emerald",
    keywords: ["market", "shopping", "price", "سوق", "شراء", "سعر"],
  },
  {
    id: "library",
    titleAr: "المكتبة",
    titleEn: "Library",
    subtitleAr: "ابحث عن كتاب وتحدث عن اهتماماتك.",
    subtitleEn: "Find a book and discuss your interests.",
    icon: "📚",
    href: "/learn/arabic-b/worlds/library",
    level: "A2",
    accent: "violet",
    keywords: ["library", "book", "reading", "مكتبة", "كتاب", "قراءة"],
  },
  {
    id: "hospital",
    titleAr: "المستشفى",
    titleEn: "Hospital",
    subtitleAr: "صف ما تشعر به واطلب المساعدة.",
    subtitleEn: "Describe how you feel and ask for help.",
    icon: "🏥",
    href: "/learn/arabic-b/worlds/hospital",
    level: "A2",
    accent: "red",
    keywords: ["hospital", "health", "doctor", "مستشفى", "طبيب", "صحة"],
  },
  {
    id: "airport",
    titleAr: "المطار",
    titleEn: "Airport",
    subtitleAr: "استعد للسفر وأكمل إجراءات الرحلة.",
    subtitleEn: "Prepare to travel and complete your journey.",
    icon: "✈️",
    href: "/learn/arabic-b/worlds/airport",
    level: "B1",
    accent: "sky",
    keywords: ["airport", "travel", "flight", "مطار", "سفر", "رحلة"],
  },
  {
    id: "university",
    titleAr: "الجامعة",
    titleEn: "University",
    subtitleAr: "ناقش الأفكار والخطط والطموحات.",
    subtitleEn: "Discuss ideas, plans and ambitions.",
    icon: "🎓",
    href: "/learn/arabic-b/worlds/university",
    level: "B2",
    accent: "navy",
    keywords: ["university", "study", "future", "جامعة", "دراسة", "مستقبل"],
  },
];

const LEVEL_INDEX: Record<string, number> = {
  A0: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
};

function searchableText(node: GraphNode): string {
  return [
    node.label,
    node.labelEn,
    node.searchableText,
    ...(node.topics ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function findNode(
  nodes: GraphNode[],
  world: WorldDefinition,
  type: string,
): GraphNode | null {
  const sameLevel = nodes.filter(
    (node) => node.level === world.level && node.type === type,
  );

  const keywordMatch = sameLevel.find((node) => {
    const text = searchableText(node);
    return world.keywords.some((keyword) =>
      text.includes(keyword.toLowerCase()),
    );
  });

  return keywordMatch ?? sameLevel[0] ?? null;
}

function createStages(
  graph: GraphExperiencePayload,
  world: WorldDefinition,
): JourneyStage[] {
  const dialogue = findNode(graph.nodes, world, "dialogue");
  const vocabulary = findNode(graph.nodes, world, "vocabulary");
  const grammar = findNode(graph.nodes, world, "grammar");
  const skill = findNode(graph.nodes, world, "skill");
  const assessment = findNode(graph.nodes, world, "assessment");

  return [
    {
      id: `${world.id}:listen`,
      titleAr: "استمع إلى الموقف",
      titleEn: "Listen to the situation",
      descriptionAr: "استمع أولًا واكتشف معنى الموقف من السياق.",
      descriptionEn: "Listen first and understand the situation from context.",
      type: "listen",
      nodeId: dialogue?.graphId ?? null,
      xp: 10,
      durationMinutes: 2,
    },
    {
      id: `${world.id}:discover`,
      titleAr: "اكتشف الكلمات",
      titleEn: "Discover the words",
      descriptionAr: "تعلّم الكلمات التي تحتاج إليها لإتمام المهمة.",
      descriptionEn: "Learn the words needed to complete the mission.",
      type: "discover",
      nodeId: vocabulary?.graphId ?? null,
      xp: 15,
      durationMinutes: 3,
    },
    {
      id: `${world.id}:speak`,
      titleAr: "قلها بصوتك",
      titleEn: "Say it yourself",
      descriptionAr: "تدرّب على النطق واستخدم العبارة في جملة.",
      descriptionEn: "Practise pronunciation and use the phrase.",
      type: "speak",
      nodeId: skill?.graphId ?? null,
      xp: 20,
      durationMinutes: 3,
    },
    {
      id: `${world.id}:practice`,
      titleAr: "ابنِ الجملة",
      titleEn: "Build the sentence",
      descriptionAr: "استخدم النمط الصحيح لبناء إجابتك.",
      descriptionEn: "Use the correct pattern to build your response.",
      type: "practice",
      nodeId: grammar?.graphId ?? null,
      xp: 20,
      durationMinutes: 3,
    },
    {
      id: `${world.id}:mission`,
      titleAr: `مهمة ${world.titleAr}`,
      titleEn: `${world.titleEn} mission`,
      descriptionAr: "طبّق ما تعلمته داخل موقف حياتي قصير.",
      descriptionEn: "Apply what you learned in a short real-life situation.",
      type: "mission",
      nodeId: dialogue?.graphId ?? null,
      xp: 35,
      durationMinutes: 5,
    },
    {
      id: `${world.id}:assessment`,
      titleAr: "أثبت جاهزيتك",
      titleEn: "Prove your readiness",
      descriptionAr: "أكمل التحدي وافتح العالم التالي.",
      descriptionEn: "Complete the challenge and unlock the next world.",
      type: "assessment",
      nodeId: assessment?.graphId ?? null,
      xp: 50,
      durationMinutes: 4,
    },
  ];
}

function createWorlds(
  graph: GraphExperiencePayload,
): JourneyWorld[] {
  const currentIndex = LEVEL_INDEX[graph.currentLevel] ?? 1;

  return WORLD_DEFINITIONS.map((world) => {
    const worldIndex = LEVEL_INDEX[world.level] ?? 0;

    return {
      ...world,
      stageCount: 6,
      recommended: world.id === "canteen",
      locked: worldIndex > currentIndex + 1,
      stages: createStages(graph, world),
    };
  });
}

function createMission(
  graph: GraphExperiencePayload,
  worlds: JourneyWorld[],
): JourneyMission {
  const recommended =
    worlds.find((world) => world.recommended) ?? worlds[0];

  return {
    id: `daily:${recommended.id}`,
    titleAr: "اطلب مشروبك باللغة العربية",
    titleEn: "Order your drink in Arabic",
    descriptionAr:
      "استمع إلى الموظف، اختر العبارة المناسبة، ثم أتمم الطلب بصوتك.",
    descriptionEn:
      "Listen to the server, choose the right phrase, then complete the order.",
    worldId: recommended.id,
    nodeId:
      graph.dailyMission.nodeId ??
      recommended.stages[0]?.nodeId ??
      null,
    xp: 80,
    durationMinutes: 8,
  };
}

export function createJourneyPayload(
  graph: GraphExperiencePayload,
): JourneyPayload {
  const worlds = createWorlds(graph);
  const recommendedWorldId =
    worlds.find((world) => world.recommended)?.id ?? "school";

  return {
    generatedAt: graph.generatedAt,
    currentLevel: graph.currentLevel,
    learnerName:
      process.env.BAYAN_LEARNER_NAME?.trim() || "Mohammed",
    worlds,
    dailyMission: createMission(graph, worlds),
    recommendedWorldId,
    knowledgeItemCount: graph.statistics.nodeCount,
    connectionCount: graph.statistics.edgeCount,
  };
}
