"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import type { LearnerJourneyState } from "../lib/journey-types";
import type {
  WorldExperienceContent,
  WorldStageContent,
} from "../lib/world-experience-types";

import styles from "../world-experience.module.css";

const STORAGE_KEY = "bayan-arabic-b-journey-v1";
const STORAGE_EVENT = "bayan-journey-update";

const EMPTY_STATE: LearnerJourneyState = {
  version: 1,
  xp: 260,
  streak: 7,
  lastVisitDate: "",
  activeWorldId: "canteen",
  activeStageIndex: 0,
  completedStageIds: [],
  completedMissionIds: [],
  worldProgress: {},
};

function readState(value: string | null): LearnerJourneyState {
  if (!value) return EMPTY_STATE;

  try {
    return {
      ...EMPTY_STATE,
      ...(JSON.parse(value) as LearnerJourneyState),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function snapshot(): string {
  if (typeof window === "undefined") {
    return JSON.stringify(EMPTY_STATE);
  }

  return (
    window.localStorage.getItem(STORAGE_KEY) ??
    JSON.stringify(EMPTY_STATE)
  );
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener(STORAGE_EVENT, callback);
  return () => window.removeEventListener(STORAGE_EVENT, callback);
}

export default function ArabicBMissionExperience({
  world,
  stage,
}: {
  world: WorldExperienceContent;
  stage: WorldStageContent;
}) {
  const raw = useSyncExternalStore(
    subscribe,
    snapshot,
    () => JSON.stringify(EMPTY_STATE),
  );

  const state = useMemo(() => readState(raw), [raw]);

  const completed = state.completedStageIds.includes(stage.id);

  function completeMission(): void {
    const current = readState(
      window.localStorage.getItem(STORAGE_KEY),
    );

    if (current.completedStageIds.includes(stage.id)) return;

    const completedStageIds = [
      ...current.completedStageIds,
      stage.id,
    ];

    const worldCompleted = world.stages.filter((item) =>
      completedStageIds.includes(item.id),
    ).length;

    const next: LearnerJourneyState = {
      ...current,
      xp: current.xp + stage.xp,
      activeWorldId: world.id,
      activeStageIndex: Math.min(
        worldCompleted,
        world.stages.length - 1,
      ),
      completedStageIds,
      worldProgress: {
        ...current.worldProgress,
        [world.id]: Math.round(
          (worldCompleted / world.stages.length) * 100,
        ),
      },
      lastVisitDate: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }

  return (
    <main
      className={`${styles.missionPage} ${
        styles[`accent_${world.accent}`]
      }`}
    >
      <header className={styles.missionHeader}>
        <Link href={`/learn/arabic-b/worlds/${world.id}`}>
          <span>→</span>
          العودة إلى {world.titleAr}
        </Link>

        <div>
          <span>🔥 {state.streak}</span>
          <strong>✦ {state.xp} XP</strong>
        </div>
      </header>

      <section className={styles.missionHero}>
        <span className={styles.largeStageIcon}>{stage.icon}</span>
        <small>{world.titleAr}</small>
        <h1>{stage.titleAr}</h1>
        <p>{stage.descriptionAr}</p>

        <div className={styles.missionMeta}>
          <span>◷ {stage.durationMinutes} دقائق</span>
          <span>✦ +{stage.xp} XP</span>
          <span>{world.level}</span>
        </div>
      </section>

      <section className={styles.challengePanel}>
        <div className={styles.characterMessage}>
          <span className={styles.characterAvatar}>
            {world.character.avatar}
          </span>
          <div>
            <small>{world.character.nameAr}</small>
            <strong>{world.character.greetingAr}</strong>
          </div>
        </div>

        <article className={styles.instructionCard}>
          <span>01</span>
          <div>
            <small>افهم الموقف</small>
            <h2>{stage.instructionAr}</h2>
          </div>
        </article>

        <article className={styles.instructionCard}>
          <span>02</span>
          <div>
            <small>العبارة المقترحة</small>
            <h2>{world.phrases[0].arabic}</h2>
            <p>{world.phrases[0].english}</p>
          </div>
        </article>

        <article className={styles.speakingChallenge}>
          <span>🎙️</span>
          <div>
            <small>تحدي التحدث</small>
            <h2>قل العبارة بصوت واضح ثم استخدمها في رد كامل.</h2>
          </div>
          <button type="button">ابدأ التسجيل</button>
        </article>

        <button
          className={
            completed
              ? styles.completedButton
              : styles.completeButton
          }
          disabled={completed}
          onClick={completeMission}
          type="button"
        >
          {completed
            ? "أكملت المرحلة ✓"
            : `إكمال المرحلة وكسب ${stage.xp} XP`}
        </button>

        {completed && (
          <Link
            className={styles.returnToWorld}
            href={`/learn/arabic-b/worlds/${world.id}`}
          >
            العودة إلى مسار العالم
          </Link>
        )}
      </section>
    </main>
  );
}
