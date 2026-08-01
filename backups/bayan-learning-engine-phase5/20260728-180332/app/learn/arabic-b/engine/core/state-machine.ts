import { WORLD_DEFINITIONS, WORLD_ORDER } from "./catalog";
import type {
  BadgeAward,
  JourneyEvent,
  JourneyState,
  WorldId,
  WorldProgress,
} from "./types";

const isoNow = (value?: string) => value ?? new Date().toISOString();
const dateOnly = (value: string) => value.slice(0, 10);

function createWorld(worldId: WorldId): WorldProgress {
  return {
    worldId,
    status:
      WORLD_DEFINITIONS[worldId].prerequisiteWorldId === null
        ? "available"
        : "locked",
    completedMissionIds: [],
    earnedXp: 0,
    startedAt: null,
    completedAt: null,
    lastActivityAt: null,
  };
}

export function createInitialJourneyState(
  learnerId = "local-learner",
  occurredAt = new Date().toISOString(),
): JourneyState {
  return {
    schemaVersion: 1,
    learnerId,
    activeWorldId: null,
    totalXp: 0,
    streakDays: 0,
    lastActiveDate: null,
    worlds: Object.fromEntries(
      WORLD_ORDER.map((id) => [id, createWorld(id)]),
    ) as JourneyState["worlds"],
    badges: [],
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };
}

function calculateStreak(
  previousDate: string | null,
  currentStreak: number,
  occurredAt: string,
) {
  const today = dateOnly(occurredAt);
  if (!previousDate) return 1;
  if (previousDate === today) return Math.max(1, currentStreak);

  const previous = new Date(`${previousDate}T00:00:00Z`);
  const current = new Date(`${today}T00:00:00Z`);
  const days = Math.round(
    (current.getTime() - previous.getTime()) / 86_400_000,
  );

  return days === 1 ? currentStreak + 1 : 1;
}

function addBadge(
  badges: BadgeAward[],
  badgeId: BadgeAward["badgeId"],
  occurredAt: string,
  worldId?: WorldId,
) {
  if (badges.some((badge) => badge.badgeId === badgeId)) return badges;
  return [...badges, { badgeId, awardedAt: occurredAt, worldId }];
}

function isUnlocked(state: JourneyState, worldId: WorldId) {
  const prerequisite = WORLD_DEFINITIONS[worldId].prerequisiteWorldId;
  return (
    prerequisite === null ||
    state.worlds[prerequisite].status === "completed"
  );
}

function finishWorld(
  state: JourneyState,
  worldId: WorldId,
  occurredAt: string,
): JourneyState {
  const world = state.worlds[worldId];
  if (world.status === "completed" || !isUnlocked(state, worldId)) {
    return state;
  }

  const definition = WORLD_DEFINITIONS[worldId];
  const bonusXp = Math.max(0, definition.xpReward - world.earnedXp);
  const index = WORLD_ORDER.indexOf(worldId);
  const nextWorldId = WORLD_ORDER[index + 1] ?? null;

  let worlds = {
    ...state.worlds,
    [worldId]: {
      ...world,
      status: "completed" as const,
      earnedXp: world.earnedXp + bonusXp,
      completedAt: occurredAt,
      lastActivityAt: occurredAt,
    },
  };

  if (nextWorldId) {
    worlds = {
      ...worlds,
      [nextWorldId]: {
        ...worlds[nextWorldId],
        status: "available",
      },
    };
  }

  return {
    ...state,
    worlds,
    activeWorldId: nextWorldId,
    totalXp: state.totalXp + bonusXp,
    badges: definition.badgeId
      ? addBadge(state.badges, definition.badgeId, occurredAt, worldId)
      : state.badges,
    updatedAt: occurredAt,
  };
}

export function journeyReducer(
  state: JourneyState,
  event: JourneyEvent,
): JourneyState {
  if (event.type === "HYDRATE") return event.state;

  if (event.type === "RESET") {
    return createInitialJourneyState(
      event.learnerId ?? state.learnerId,
      isoNow(event.occurredAt),
    );
  }

  const occurredAt = isoNow(event.occurredAt);
  const activity = {
    updatedAt: occurredAt,
    lastActiveDate: dateOnly(occurredAt),
    streakDays: calculateStreak(
      state.lastActiveDate,
      state.streakDays,
      occurredAt,
    ),
  };

  if (event.type === "START_WORLD") {
    if (!isUnlocked(state, event.worldId)) return state;
    const world = state.worlds[event.worldId];

    return {
      ...state,
      ...activity,
      activeWorldId: event.worldId,
      badges:
        state.badges.length === 0
          ? addBadge(
              state.badges,
              "first-step",
              occurredAt,
              event.worldId,
            )
          : state.badges,
      worlds: {
        ...state.worlds,
        [event.worldId]: {
          ...world,
          status:
            world.status === "completed" ? "completed" : "active",
          startedAt: world.startedAt ?? occurredAt,
          lastActivityAt: occurredAt,
        },
      },
    };
  }

  if (event.type === "SET_ACTIVE_WORLD") {
    if (!isUnlocked(state, event.worldId)) return state;
    return { ...state, ...activity, activeWorldId: event.worldId };
  }

  if (event.type === "AWARD_BADGE") {
    return {
      ...state,
      ...activity,
      badges: addBadge(
        state.badges,
        event.badgeId,
        occurredAt,
        event.worldId,
      ),
    };
  }

  if (event.type === "COMPLETE_WORLD") {
    return finishWorld(
      { ...state, ...activity },
      event.worldId,
      occurredAt,
    );
  }

  if (event.type === "COMPLETE_MISSION") {
    if (!isUnlocked(state, event.worldId)) return state;

    const world = state.worlds[event.worldId];
    if (world.completedMissionIds.includes(event.missionId)) {
      return { ...state, ...activity, activeWorldId: event.worldId };
    }

    const completedMissionIds = [
      ...world.completedMissionIds,
      event.missionId,
    ];
    const xp = Math.max(0, event.xp);

    const next: JourneyState = {
      ...state,
      ...activity,
      activeWorldId: event.worldId,
      totalXp: state.totalXp + xp,
      worlds: {
        ...state.worlds,
        [event.worldId]: {
          ...world,
          status: "active",
          completedMissionIds,
          earnedXp: world.earnedXp + xp,
          startedAt: world.startedAt ?? occurredAt,
          lastActivityAt: occurredAt,
        },
      },
    };

    return completedMissionIds.length >=
      WORLD_DEFINITIONS[event.worldId].missionCount
      ? finishWorld(next, event.worldId, occurredAt)
      : next;
  }

  return state;
}
