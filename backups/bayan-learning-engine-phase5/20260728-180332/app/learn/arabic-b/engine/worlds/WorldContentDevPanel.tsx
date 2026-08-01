"use client";

import { useJourneyWorlds } from "./useJourneyWorlds";

export default function WorldContentDevPanel() {
  const { worlds, currentWorld } = useJourneyWorlds();

  return (
    <section
      style={{
        margin: "28px auto",
        width: "min(1180px, calc(100% - 32px))",
        padding: 24,
        borderRadius: 24,
        background: "rgba(255,255,255,.92)",
        boxShadow: "0 18px 60px rgba(14,55,45,.12)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <strong style={{ fontSize: 20 }}>
          BAYAN World Content Engine · Phase 2
        </strong>
        <p style={{ margin: "6px 0 0", opacity: 0.72 }}>
          Current world: {currentWorld.world.title.en} ·{" "}
          {currentWorld.world.title.ar}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {worlds.map(
          ({ world, scenes, missions, vocabulary, status, progress }) => (
            <article
              key={world.id}
              style={{
                padding: 16,
                border: "1px solid rgba(20,80,65,.14)",
                borderRadius: 18,
              }}
            >
              <div style={{ fontSize: 30 }}>{world.icon}</div>
              <h3 style={{ margin: "8px 0 2px" }}>{world.title.en}</h3>
              <div dir="rtl" style={{ fontWeight: 700 }}>
                {world.title.ar}
              </div>
              <p style={{ fontSize: 13, opacity: 0.72 }}>{world.subtitle.en}</p>
              <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                <div>Status: {status}</div>
                <div>Progress: {progress}%</div>
                <div>Scenes: {scenes.length}</div>
                <div>Missions: {missions.length}</div>
                <div>Vocabulary: {vocabulary.length}</div>
                <div>XP reward: {world.xpReward}</div>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
