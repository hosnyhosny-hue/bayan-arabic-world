export type JourneyWorldId =
  | "school"
  | "canteen"
  | "market"
  | "library"
  | "hospital"
  | "airport"
  | "university";

export type JourneyStage = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  type:
    | "listen"
    | "discover"
    | "speak"
    | "practice"
    | "mission"
    | "assessment";
  nodeId: string | null;
  xp: number;
  durationMinutes: number;
};

export type JourneyWorld = {
  id: JourneyWorldId;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: string;
  href: string;
  level: string;
  accent: string;
  stageCount: number;
  recommended: boolean;
  locked: boolean;
  stages: JourneyStage[];
};

export type JourneyMission = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  worldId: JourneyWorldId;
  nodeId: string | null;
  xp: number;
  durationMinutes: number;
};

export type JourneyPayload = {
  generatedAt: string;
  currentLevel: string;
  learnerName: string;
  worlds: JourneyWorld[];
  dailyMission: JourneyMission;
  recommendedWorldId: JourneyWorldId;
  knowledgeItemCount: number;
  connectionCount: number;
};

export type LearnerJourneyState = {
  version: 1;
  xp: number;
  streak: number;
  lastVisitDate: string;
  activeWorldId: JourneyWorldId;
  activeStageIndex: number;
  completedStageIds: string[];
  completedMissionIds: string[];
  worldProgress: Partial<Record<JourneyWorldId, number>>;
};
