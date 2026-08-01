"use client";

import Link from "next/link";
import {
  useMemo,
  useSyncExternalStore,
} from "react";

import type {
  JourneyPayload,
  JourneyStage,
  JourneyWorld,
  JourneyWorldId,
  LearnerJourneyState,
} from "../lib/journey-types";

import styles from "../journey.module.css";

const STORAGE_KEY = "bayan-arabic-b-journey-v1";
const STORAGE_EVENT = "bayan-journey-update";

const DEFAULT_STATE: LearnerJourneyState = {
  version: 1,
  xp: 260,
  streak: 7,
  lastVisitDate: "",
  activeWorldId: "canteen",
  activeStageIndex: 2,
  completedStageIds: [
    "school:listen",
    "school:discover",
    "school:speak",
    "school:practice",
    "school:mission",
    "school:assessment",
    "canteen:listen",
    "canteen:discover",
  ],
  completedMissionIds: [],
  worldProgress: {
    school: 100,
    canteen: 33,
    market: 0,
    library: 0,
    hospital: 0,
    airport: 0,
    university: 0,
  },
};

function parseState(value: string | null): LearnerJourneyState {
  if (!value) {
    return DEFAULT_STATE;
  }

  try {
    const parsed = JSON.parse(value) as Partial<LearnerJourneyState>;

    return {
      ...DEFAULT_STATE,
      ...parsed,
      worldProgress: {
        ...DEFAULT_STATE.worldProgress,
        ...(parsed.worldProgress ?? {}),
      },
      completedStageIds: parsed.completedStageIds ?? [],
      completedMissionIds: parsed.completedMissionIds ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function getSnapshot(): string {
  if (typeof window === "undefined") {
    return JSON.stringify(DEFAULT_STATE);
  }

  return (
    window.localStorage.getItem(STORAGE_KEY) ??
    JSON.stringify(DEFAULT_STATE)
  );
}

function getServerSnapshot(): string {
  return JSON.stringify(DEFAULT_STATE);
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function updateJourneyState(
  updater: (current: LearnerJourneyState) => LearnerJourneyState,
): void {
  const current = parseState(
    window.localStorage.getItem(STORAGE_KEY),
  );

  const next = updater(current);

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next),
  );

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function stageIcon(type: JourneyStage["type"]): string {
  const icons: Record<JourneyStage["type"], string> = {
    listen: "◖",
    discover: "أ",
    speak: "◉",
    practice: "✦",
    mission: "◆",
    assessment: "✓",
  };

  return icons[type];
}

function worldProgress(
  state: LearnerJourneyState,
  worldId: JourneyWorldId,
): number {
  return Math.max(
    0,
    Math.min(100, state.worldProgress[worldId] ?? 0),
  );
}

export default function ArabicBJourneyEngine({
  payload,
}: {
  payload: JourneyPayload;
}) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const state = useMemo(
    () => parseState(snapshot),
    [snapshot],
  );

  const activeWorld =
    payload.worlds.find(
      (world) => world.id === state.activeWorldId,
    ) ??
    payload.worlds.find(
      (world) => world.id === payload.recommendedWorldId,
    ) ??
    payload.worlds[0];

  const activeStage =
    activeWorld.stages[
      Math.min(
        state.activeStageIndex,
        activeWorld.stages.length - 1,
      )
    ] ?? activeWorld.stages[0];

  const readiness = Math.round(
    payload.worlds.reduce(
      (total, world) =>
        total + worldProgress(state, world.id),
      0,
    ) / payload.worlds.length,
  );

  function selectWorld(world: JourneyWorld): void {
    if (world.locked) {
      return;
    }

    const completedCount = world.stages.filter((stage) =>
      state.completedStageIds.includes(stage.id),
    ).length;

    updateJourneyState((current) => ({
      ...current,
      activeWorldId: world.id,
      activeStageIndex: Math.min(
        completedCount,
        world.stages.length - 1,
      ),
      lastVisitDate: new Date().toISOString(),
    }));
  }

  function completeActiveStage(): void {
    if (!activeStage) {
      return;
    }

    updateJourneyState((current) => {
      const alreadyCompleted =
        current.completedStageIds.includes(activeStage.id);

      const completedStageIds = alreadyCompleted
        ? current.completedStageIds
        : [...current.completedStageIds, activeStage.id];

      const completedInWorld = activeWorld.stages.filter(
        (stage) => completedStageIds.includes(stage.id),
      ).length;

      const progress = Math.round(
        (completedInWorld / activeWorld.stages.length) * 100,
      );

      return {
        ...current,
        xp: alreadyCompleted
          ? current.xp
          : current.xp + activeStage.xp,
        activeStageIndex: Math.min(
          current.activeStageIndex + 1,
          activeWorld.stages.length - 1,
        ),
        completedStageIds,
        worldProgress: {
          ...current.worldProgress,
          [activeWorld.id]: progress,
        },
        lastVisitDate: new Date().toISOString(),
      };
    });
  }

  function completeDailyMission(): void {
    updateJourneyState((current) => {
      const completed =
        current.completedMissionIds.includes(
          payload.dailyMission.id,
        );

      return {
        ...current,
        xp: completed
          ? current.xp
          : current.xp + payload.dailyMission.xp,
        completedMissionIds: completed
          ? current.completedMissionIds
          : [
              ...current.completedMissionIds,
              payload.dailyMission.id,
            ],
        activeWorldId: payload.dailyMission.worldId,
        lastVisitDate: new Date().toISOString(),
      };
    });
  }

  const dailyMissionCompleted =
    state.completedMissionIds.includes(
      payload.dailyMission.id,
    );

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandSymbol}>ض</span>
          <span>
            <strong>BAYAN</strong>
            <small>Arabic World</small>
          </span>
        </Link>

        <nav className={styles.nav}>
          <a href="#journey">رحلتي</a>
          <a href="#worlds">العوالم</a>
          <a href="#progress">تقدمي</a>
        </nav>

        <div className={styles.headerStats}>
          <span className={styles.streak}>🔥 {state.streak}</span>
          <span className={styles.xp}>✦ {state.xp} XP</span>
          <span className={styles.avatar}>
            {payload.learnerName.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.welcome}>
            مرحبًا بعودتك، {payload.learnerName}
          </span>

          <h1>
            أكمل رحلتك في
            <strong> العالم العربي</strong>
          </h1>

          <p>
            اليوم ستستخدم العربية في موقف حقيقي، وتكسب نقاطًا،
            وتفتح خطوة جديدة في رحلتك.
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              onClick={completeActiveStage}
              type="button"
            >
              أكمل التعلم
              <span>←</span>
            </button>

            <a className={styles.secondaryButton} href="#worlds">
              استكشف العوالم
            </a>
          </div>
        </div>

        <article className={styles.activeJourneyCard}>
          <div className={styles.activeJourneyTop}>
            <span className={styles.continueLabel}>
              استكمل من حيث توقفت
            </span>
            <span className={styles.levelBadge}>
              {activeWorld.level}
            </span>
          </div>

          <div className={styles.activeWorld}>
            <span className={styles.activeWorldIcon}>
              {activeWorld.icon}
            </span>
            <div>
              <h2>{activeWorld.titleAr}</h2>
              <p>{activeWorld.subtitleAr}</p>
            </div>
          </div>

          <div className={styles.stagePreview}>
            <span className={styles.stageIcon}>
              {stageIcon(activeStage.type)}
            </span>
            <div>
              <small>خطوتك التالية</small>
              <strong>{activeStage.titleAr}</strong>
              <p>{activeStage.descriptionAr}</p>
            </div>
          </div>

          <div className={styles.progressHeader}>
            <span>تقدم الرحلة</span>
            <strong>
              {worldProgress(state, activeWorld.id)}%
            </strong>
          </div>

          <div className={styles.progressBar}>
            <span
              style={{
                width: `${worldProgress(
                  state,
                  activeWorld.id,
                )}%`,
              }}
            />
          </div>

          <div className={styles.activeJourneyFooter}>
            <span>◷ {activeStage.durationMinutes} دقائق</span>
            <span>+{activeStage.xp} XP</span>
          </div>
        </article>
      </section>

      <section className={styles.dailySection}>
        <article className={styles.dailyMission}>
          <div className={styles.missionArtwork}>
            <span>☕</span>
          </div>

          <div className={styles.missionContent}>
            <span className={styles.missionEyebrow}>
              مهمة اليوم
            </span>

            <h2>{payload.dailyMission.titleAr}</h2>
            <p>{payload.dailyMission.descriptionAr}</p>

            <div className={styles.missionDetails}>
              <span>
                ◷ {payload.dailyMission.durationMinutes} دقائق
              </span>
              <span>✦ +{payload.dailyMission.xp} XP</span>
              <span>◉ استماع ونطق</span>
            </div>
          </div>

          <button
            className={
              dailyMissionCompleted
                ? styles.completedMissionButton
                : styles.missionButton
            }
            disabled={dailyMissionCompleted}
            onClick={completeDailyMission}
            type="button"
          >
            {dailyMissionCompleted
              ? "تمت المهمة ✓"
              : "ابدأ المهمة"}
          </button>
        </article>

        <article className={styles.coachCard}>
          <div className={styles.coachAvatar}>ب</div>
          <div>
            <span>مدربك بيان</span>
            <strong>
              أداؤك في الاستماع ممتاز، والخطوة التالية هي التحدث
              بجملة كاملة.
            </strong>
            <p>
              ابدأ بعبارة «أريد» ثم أضف الشيء الذي ترغب في طلبه.
            </p>
          </div>
        </article>
      </section>

      <section className={styles.journeySection} id="journey">
        <div className={styles.sectionHeading}>
          <div>
            <span>رحلتك الحالية</span>
            <h2>{activeWorld.titleAr}</h2>
          </div>

          <p>
            لا توجد دروس منفصلة هنا؛ كل خطوة تقودك طبيعيًا إلى
            الموقف التالي.
          </p>
        </div>

        <div className={styles.journeyPath}>
          {activeWorld.stages.map((stage, index) => {
            const completed =
              state.completedStageIds.includes(stage.id);
            const active = stage.id === activeStage.id;
            const locked =
              !completed &&
              !active &&
              index > state.activeStageIndex;

            return (
              <button
                className={[
                  styles.pathStage,
                  completed ? styles.completedStage : "",
                  active ? styles.activeStage : "",
                  locked ? styles.lockedStage : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={locked}
                key={stage.id}
                onClick={() => {
                  updateJourneyState((current) => ({
                    ...current,
                    activeStageIndex: index,
                  }));
                }}
                type="button"
              >
                <span className={styles.pathStageNumber}>
                  {completed ? "✓" : stageIcon(stage.type)}
                </span>

                <span className={styles.pathStageCopy}>
                  <small>
                    الخطوة {index + 1}
                  </small>
                  <strong>{stage.titleAr}</strong>
                  <span>{stage.durationMinutes} دقائق</span>
                </span>

                <span className={styles.pathXp}>
                  +{stage.xp}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.worldsSection} id="worlds">
        <div className={styles.sectionHeading}>
          <div>
            <span>عوالم الحياة</span>
            <h2>تعلّم العربية حيث تحتاج إليها</h2>
          </div>

          <p>
            اختر عالمًا، وعش موقفًا، واستخدم اللغة لإنجاز هدف
            حقيقي.
          </p>
        </div>

        <div className={styles.worldGrid}>
          {payload.worlds.map((world) => {
            const progress = worldProgress(state, world.id);
            const isActive = activeWorld.id === world.id;

            return (
              <article
                className={[
                  styles.worldCard,
                  styles[`accent_${world.accent}`],
                  isActive ? styles.activeWorldCard : "",
                  world.locked ? styles.lockedWorldCard : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={world.id}
              >
                <div className={styles.worldCardTop}>
                  <span className={styles.worldIcon}>
                    {world.icon}
                  </span>

                  <div className={styles.worldBadges}>
                    <span>{world.level}</span>
                    {world.recommended && (
                      <strong>موصى به</strong>
                    )}
                  </div>
                </div>

                <h3>{world.titleAr}</h3>
                <p>{world.subtitleAr}</p>

                <div className={styles.worldProgressHeader}>
                  <span>
                    {world.locked
                      ? "أكمل المستوى السابق"
                      : `${progress}% جاهزية`}
                  </span>
                  <strong>
                    {world.locked ? "🔒" : `${world.stageCount} مراحل`}
                  </strong>
                </div>

                <div className={styles.worldProgressBar}>
                  <span style={{ width: `${progress}%` }} />
                </div>

                <div className={styles.worldActions}>
                  <button
                    disabled={world.locked}
                    onClick={() => selectWorld(world)}
                    type="button"
                  >
                    {isActive
                      ? "الرحلة الحالية"
                      : progress > 0
                        ? "متابعة"
                        : "ابدأ الرحلة"}
                  </button>

                  {!world.locked && (
                    <Link href={world.href}>
                      دخول العالم
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.progressSection} id="progress">
        <article className={styles.readinessCard}>
          <div className={styles.readinessRing}>
            <div>
              <strong>{readiness}%</strong>
              <span>جاهزية حياتية</span>
            </div>
          </div>

          <div className={styles.readinessCopy}>
            <span>تقدمك الحقيقي</span>
            <h2>أنت جاهز لمواقف أكثر كل يوم</h2>
            <p>
              نقيس قدرتك على استخدام العربية في الحياة، وليس عدد
              الصفحات التي فتحتها.
            </p>
          </div>
        </article>

        <article className={styles.achievementCard}>
          <span className={styles.achievementIcon}>🏅</span>
          <div>
            <small>إنجازك القادم</small>
            <strong>متحدث المقهى</strong>
            <p>
              أكمل مهمة المقهى النهائية لتحصل على الشارة و150 XP.
            </p>
          </div>
          <span className={styles.achievementProgress}>2/3</span>
        </article>

        <article className={styles.nextRecommendation}>
          <span className={styles.nextIcon}>🛍️</span>
          <div>
            <small>العالم المقترح بعد ذلك</small>
            <strong>السوق</strong>
            <p>استخدم الأرقام واسأل عن الأسعار والكمية.</p>
          </div>
          <span>←</span>
        </article>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>BAYAN Arabic World</strong>
          <span>
            رحلة عربية عالمية تتكيف مع كل متعلم
          </span>
        </div>

        <div>
          المستوى {payload.currentLevel} ·{" "}
          {payload.knowledgeItemCount} عنصرًا تعليميًا مترابطًا
        </div>
      </footer>
    </main>
  );
}
