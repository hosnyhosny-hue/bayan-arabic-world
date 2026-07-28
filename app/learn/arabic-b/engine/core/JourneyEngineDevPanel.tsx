"use client";

import { useJourneyEngine } from "./JourneyEngineProvider";
import type { WorldId } from "./types";

const demoMissions = [
  "demo-mission-1",
  "demo-mission-2",
  "demo-mission-3",
];

export default function JourneyEngineDevPanel() {
  const engine = useJourneyEngine();
  const worldId: WorldId = engine.currentWorldId;
  const world = engine.state.worlds[worldId];
  const nextMission = demoMissions.find(
    (id) => !world.completedMissionIds.includes(id),
  );

  return (
    <aside
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 999,
        width: 310,
        padding: 16,
        borderRadius: 18,
        background: "rgba(9, 45, 37, 0.96)",
        color: "white",
        boxShadow: "0 20px 60px rgba(0,0,0,.28)",
        fontFamily: "inherit",
      }}
    >
      <b>BAYAN Journey Engine · Phase 1</b>
      <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.7 }}>
        <div>Current world: {worldId}</div>
        <div>Status: {world.status}</div>
        <div>World progress: {engine.getWorldProgress(worldId)}%</div>
        <div>Journey progress: {engine.journeyProgress}%</div>
        <div>Total XP: {engine.state.totalXp}</div>
        <div>Badges: {engine.state.badges.length}</div>
        <div>Streak: {engine.state.streakDays}</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 12,
        }}
      >
        <button
          type="button"
          onClick={() => engine.startWorld(worldId)}
          style={{ padding: 9, borderRadius: 10, cursor: "pointer" }}
        >
          Start world
        </button>

        <button
          type="button"
          disabled={!nextMission}
          onClick={() => {
            if (nextMission) {
              engine.completeMission(worldId, nextMission, 25);
            }
          }}
          style={{ padding: 9, borderRadius: 10, cursor: "pointer" }}
        >
          Complete mission
        </button>

        <button
          type="button"
          onClick={() => engine.completeWorld(worldId)}
          style={{ padding: 9, borderRadius: 10, cursor: "pointer" }}
        >
          Complete world
        </button>

        <button
          type="button"
          onClick={() => void engine.resetJourney()}
          style={{ padding: 9, borderRadius: 10, cursor: "pointer" }}
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
