"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJourneyEngine } from "../../engine/core/JourneyEngineProvider";
import type { WorldId } from "../../engine/core/types";
import { getWorldExperience } from "../../engine/worlds/generated-world-experience-registry";
import {
  MissionRenderer,
  normalizeMission,
  trackLearningEvent,
  type SubmissionResult,
} from "../../learning";
import styles from "./learning-mission.module.css";

type UnknownRecord = Record<string, unknown>;

export default function LearningMissionPage() {
  const params = useParams<{ worldId: string; missionId: string }>();
  const router = useRouter();
  const worldId = params.worldId as WorldId;
  const world = getWorldExperience(worldId);

  const missionIndex =
    world?.missions.findIndex(
      (item) => String((item as UnknownRecord).id) === params.missionId,
    ) ?? -1;

  const rawMission =
    missionIndex >= 0
      ? (world?.missions[missionIndex] as UnknownRecord)
      : undefined;

  const mission = useMemo(
    () =>
      rawMission ? normalizeMission(worldId, rawMission, missionIndex) : null,
    [missionIndex, rawMission, worldId],
  );

  if (!world || !mission) {
    return (
      <main className={styles.notFound}>
        <h1>Mission not found</h1>
        <Link href={`/learn/arabic-b/worlds/${worldId}`}>Back to world</Link>
      </main>
    );
  }

  return (
    <MissionRuntime
      mission={mission}
      worldId={worldId}
      missionIndex={missionIndex}
      missionCount={world.missions.length}
      onExit={() => router.push(`/learn/arabic-b/worlds/${worldId}`)}
    />
  );
}

function MissionRuntime({
  mission,
  worldId,
  missionIndex,
  missionCount,
  onExit,
}: {
  mission: ReturnType<typeof normalizeMission>;
  worldId: WorldId;
  missionIndex: number;
  missionCount: number;
  onExit: () => void;
}) {
  const engine = useJourneyEngine();
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    trackLearningEvent(mission, "started");
  }, [mission]);

  const submit = (result: SubmissionResult) => {
    setAttempts((value) => value + 1);
    setScore((value) => Math.max(value, result.score));
    setCompleted((value) => value || result.correct);
    setFeedback(result.feedback);
    trackLearningEvent(
      mission,
      result.correct ? "completed" : "attempted",
      result.score,
    );
  };

  const collectXp = () => {
    engine.completeMission(worldId, mission.id, mission.xp);
    onExit();
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" onClick={onExit}>
          ← Exit mission
        </button>
        <div className={styles.step}>
          <span>
            Mission {missionIndex + 1} of {missionCount}
          </span>
          <div>
            <i
              style={{ width: `${((missionIndex + 1) / missionCount) * 100}%` }}
            />
          </div>
        </div>
        <strong>+{mission.xp} XP</strong>
      </header>

      <section className={styles.shell}>
        <aside className={styles.meta}>
          <span>{mission.type}</span>
          <h1>{mission.title}</h1>
          <p>{mission.instruction}</p>
          <dl>
            <div>
              <dt>Attempts</dt>
              <dd>{attempts}</dd>
            </div>
            <div>
              <dt>Best score</dt>
              <dd>{score}%</dd>
            </div>
          </dl>
        </aside>

        <article className={styles.activity}>
          <MissionRenderer mission={mission} onSubmit={submit} />

          {feedback ? (
            <div
              className={`${styles.feedback} ${completed ? styles.success : ""}`}
            >
              <strong>
                {completed ? "Activity complete" : "Keep learning"}
              </strong>
              <p>{feedback}</p>
            </div>
          ) : null}

          {completed ? (
            <button
              type="button"
              className={styles.complete}
              onClick={collectXp}
            >
              Collect {mission.xp} XP and continue
            </button>
          ) : null}
        </article>
      </section>
    </main>
  );
}
