import type { BadgeId, WorldId } from "./types";

export const WORLD_ORDER: WorldId[] = [
  "school",
  "canteen",
  "library",
  "market",
  "hospital",
  "airport",
  "university",
];

export const WORLD_DEFINITIONS: Record<
  WorldId,
  {
    prerequisiteWorldId: WorldId | null;
    missionCount: number;
    xpReward: number;
    badgeId?: BadgeId;
  }
> = {
  school: {
    prerequisiteWorldId: null,
    missionCount: 3,
    xpReward: 120,
    badgeId: "school-graduate",
  },
  canteen: {
    prerequisiteWorldId: "school",
    missionCount: 3,
    xpReward: 160,
    badgeId: "everyday-speaker",
  },
  library: {
    prerequisiteWorldId: "canteen",
    missionCount: 3,
    xpReward: 190,
  },
  market: {
    prerequisiteWorldId: "library",
    missionCount: 3,
    xpReward: 240,
    badgeId: "market-explorer",
  },
  hospital: {
    prerequisiteWorldId: "market",
    missionCount: 3,
    xpReward: 280,
  },
  airport: {
    prerequisiteWorldId: "hospital",
    missionCount: 3,
    xpReward: 340,
    badgeId: "confident-traveller",
  },
  university: {
    prerequisiteWorldId: "airport",
    missionCount: 3,
    xpReward: 500,
    badgeId: "arabic-world-citizen",
  },
};
