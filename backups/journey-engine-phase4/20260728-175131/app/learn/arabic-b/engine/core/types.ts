export type WorldId =
  | "school"
  | "canteen"
  | "library"
  | "market"
  | "hospital"
  | "airport"
  | "university";

export type WorldStatus = "locked" | "available" | "active" | "completed";

export type BadgeId =
  | "first-step"
  | "school-graduate"
  | "everyday-speaker"
  | "market-explorer"
  | "confident-traveller"
  | "arabic-world-citizen";

export type WorldProgress = {
  worldId: WorldId;
  status: WorldStatus;
  completedMissionIds: string[];
  earnedXp: number;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string | null;
};

export type BadgeAward = {
  badgeId: BadgeId;
  awardedAt: string;
  worldId?: WorldId;
};

export type JourneyState = {
  schemaVersion: 1;
  learnerId: string;
  activeWorldId: WorldId | null;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string | null;
  worlds: Record<WorldId, WorldProgress>;
  badges: BadgeAward[];
  createdAt: string;
  updatedAt: string;
};

export type JourneyEvent =
  | { type: "HYDRATE"; state: JourneyState }
  | { type: "START_WORLD"; worldId: WorldId; occurredAt?: string }
  | {
      type: "COMPLETE_MISSION";
      worldId: WorldId;
      missionId: string;
      xp: number;
      occurredAt?: string;
    }
  | { type: "COMPLETE_WORLD"; worldId: WorldId; occurredAt?: string }
  | {
      type: "AWARD_BADGE";
      badgeId: BadgeId;
      worldId?: WorldId;
      occurredAt?: string;
    }
  | { type: "SET_ACTIVE_WORLD"; worldId: WorldId; occurredAt?: string }
  | { type: "RESET"; learnerId?: string; occurredAt?: string };
