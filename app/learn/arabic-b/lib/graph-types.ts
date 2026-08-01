export type GraphNodeType =
  | "framework-level"
  | "vocabulary"
  | "grammar"
  | "skill"
  | "dialogue"
  | "culture"
  | "assessment"
  | "topic"
  | string;

export type GraphNode = {
  graphId: string;
  sourceId: string;
  type: GraphNodeType;
  level: string | null;
  label: string;
  labelEn: string | null;
  sourceCollection?: string;
  status?: string;
  topics?: string[];
  searchableText?: string;
  normalizedLabel?: string;
  normalizedLabelLoose?: string;
  normalizedSearchText?: string;
  searchTokens?: string[];
  metadata?: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  type: string;
  confidence?: number;
  weight?: number;
  origin?: string;
  evidence?: string[];
  status?: string;
  metadata?: Record<string, unknown>;
};

export type GraphRelation = {
  edge: GraphEdge;
  node: GraphNode;
  direction: "incoming" | "outgoing";
};

export type GraphStatistics = {
  nodeCount: number;
  edgeCount: number;
  orphanCount: number;
  nodesByType: Record<string, number>;
  nodesByLevel: Record<string, number>;
  edgesByType: Record<string, number>;
};

export type LearningLevel = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  nodeCount: number;
  progress: number;
  isCurrent: boolean;
  isLocked: boolean;
};

export type DailyMission = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  nodeId: string | null;
  rewardXp: number;
  durationMinutes: number;
};

export type GraphExperiencePayload = {
  generatedAt: string;
  version: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  statistics: GraphStatistics;
  levels: LearningLevel[];
  dailyMission: DailyMission;
  featuredNodeIds: string[];
  currentLevel: string;
};
