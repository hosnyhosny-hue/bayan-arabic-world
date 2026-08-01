import { WORLD_DEFINITIONS, WORLD_ORDER } from "./catalog";
import type { JourneyState, WorldId } from "./types";

export function selectWorldProgress(
  state: JourneyState,
  worldId: WorldId,
) {
  if (state.worlds[worldId].status === "completed") return 100;

  const total = WORLD_DEFINITIONS[worldId].missionCount;
  const completed =
    state.worlds[worldId].completedMissionIds.length;

  return total === 0
    ? 0
    : Math.min(100, Math.round((completed / total) * 100));
}

export function selectJourneyProgress(state: JourneyState) {
  const completed = WORLD_ORDER.filter(
    (id) => state.worlds[id].status === "completed",
  ).length;

  return Math.round((completed / WORLD_ORDER.length) * 100);
}

export function selectCompletedWorldCount(state: JourneyState) {
  return WORLD_ORDER.filter(
    (id) => state.worlds[id].status === "completed",
  ).length;
}

export function selectCurrentWorldId(
  state: JourneyState,
): WorldId {
  return (
    state.activeWorldId ??
    WORLD_ORDER.find((id) => state.worlds[id].status !== "locked") ??
    "school"
  );
}
