"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { buildCoachInsight } from "../lib/coach-engine";

import type { LearnerJourneyState } from "../lib/journey-types";

import type {
  WorldExperienceContent,
  WorldStageContent,
} from "../lib/world-experience-types";

import styles from "../world-experience.module.css";

const STORAGE_KEY = "bayan-arabic-b-journey-v1";
const STORAGE_EVENT = "bayan-journey-update";

const DEFAULT_STATE: LearnerJourneyState = {
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

function parseState(value: string | null): LearnerJourneyState {
  if (!value) {
    return DEFAULT_STATE;
  }

  try {
    const parsed = JSON.parse(value) as Partial<LearnerJourneyState>;

    return {
      ...DEFAULT_STATE,
      ...parsed,
      completedStageIds: parsed.completedStageIds ?? [],
      completedMissionIds: parsed.completedMissionIds ?? [],
      worldProgress: parsed.worldProgress ?? {},
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

  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", storageHandler);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function saveState(
  updater: (state: LearnerJourneyState) => LearnerJourneyState,
): void {
  const current = parseState(
    window.localStorage.getItem(STORAGE_KEY),
  );

  const next = updater(current);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function stageStatus(
  stage: WorldStageContent,
  index: number,
  completedIds: string[],
): "completed" | "active" | "available" | "locked" {
  if (completedIds.includes(stage.id)) {
    return "completed";
  }

  const completedBefore = index === 0 ||
    completedIds.includes(
      stage.id.replace(
        stage.id.split(":")[1],
        ["listen", "discover", "speak", "practice", "mission"][
          index - 1
        ] ?? "listen",
      ),
    );

  if (index === 0 || completedBefore) {
    return "active";
  }

  return index <= completedIds.length + 1
    ? "available"
    : "locked";
}

export default function ArabicBWorldExperience({
  content,
}: {
  content: WorldExperienceContent;
}) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const state = useMemo(() => parseState(snapshot), [snapshot]);

  const completedCount = content.stages.filter((stage) =>
    state.completedStageIds.includes(stage.id),
  ).length;

  const progress = Math.round(
    (completedCount / content.stages.length) * 100,
  );

  const coach = buildCoachInsight(content, state);

  const nextStage =
    content.stages.find(
      (stage) => !state.completedStageIds.includes(stage.id),
    ) ?? content.stages.at(-1);

  function activateWorld(): void {
    saveState((current) => ({
      ...current,
      activeWorldId: content.id,
      activeStageIndex: Math.min(
        completedCount,
        content.stages.length - 1,
      ),
      lastVisitDate: new Date().toISOString(),
    }));
  }

  function completeStage(stage: WorldStageContent): void {
    saveState((current) => {
      const alreadyCompleted =
        current.completedStageIds.includes(stage.id);

      const completedStageIds = alreadyCompleted
        ? current.completedStageIds
        : [...current.completedStageIds, stage.id];

      const count = content.stages.filter((item) =>
        completedStageIds.includes(item.id),
      ).length;

      return {
        ...current,
        xp: alreadyCompleted
          ? current.xp
          : current.xp + stage.xp,
        activeWorldId: content.id,
        activeStageIndex: Math.min(
          count,
          content.stages.length - 1,
        ),
        completedStageIds,
        worldProgress: {
          ...current.worldProgress,
          [content.id]: Math.round(
            (count / content.stages.length) * 100,
          ),
        },
        lastVisitDate: new Date().toISOString(),
      };
    });
  }

  return (
    <main
      className={`${styles.page} ${styles[`accent_${content.accent}`]}`}
    >
      <header className={styles.header}>
        <Link className={styles.brand} href="/learn/arabic-b">
          <span className={styles.brandMark}>ض</span>
          <span>
            <strong>BAYAN</strong>
            <small>Arabic Journey</small>
          </span>
        </Link>

        <Link className={styles.backLink} href="/learn/arabic-b">
          العودة إلى العوالم
          <span>←</span>
        </Link>

        <div className={styles.userStats}>
          <span>🔥 {state.streak}</span>
          <strong>✦ {state.xp} XP</strong>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.heroBadges}>
            <span>{content.eyebrowAr}</span>
            <strong>{content.level}</strong>
          </div>

          <h1>{content.titleAr}</h1>
          <p className={styles.englishTitle}>
            {content.titleEn}
          </p>

          <p className={styles.story}>{content.storyAr}</p>

          <div className={styles.location}>
            <span>⌖</span>
            {content.locationAr}
          </div>

          <div className={styles.heroActions}>
            {nextStage && (
              <Link
                className={styles.primaryAction}
                href={`/learn/arabic-b/worlds/${content.id}/missions/${nextStage.id.split(":")[1]}`}
                onClick={activateWorld}
              >
                {progress > 0 ? "متابعة الرحلة" : "ابدأ الرحلة"}
                <span>←</span>
              </Link>
            )}

            <a className={styles.secondaryAction} href="#story-path">
              شاهد مراحل العالم
            </a>
          </div>
        </div>

        <div className={styles.sceneCard}>
          <div className={styles.sceneTop}>
            <span>{content.sceneEmoji}</span>
            <strong>{progress}%</strong>
          </div>

          <div className={styles.sceneCharacter}>
            <div className={styles.characterAvatar}>
              {content.character.avatar}
            </div>

            <div>
              <small>{content.character.roleAr}</small>
              <strong>{content.character.nameAr}</strong>
            </div>
          </div>

          <blockquote>
            «{content.character.greetingAr}»
          </blockquote>

          <div className={styles.sceneProgress}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className={styles.sceneFooter}>
            <span>
              {completedCount}/{content.stages.length} مراحل
            </span>
            <span>{content.rewardXp} XP مكافأة</span>
          </div>
        </div>
      </section>

      <section className={styles.missionBrief}>
        <div className={styles.missionIcon}>🎯</div>

        <div>
          <span>مهمتك داخل هذا العالم</span>
          <h2>{content.missionTitleAr}</h2>
          <p>{content.missionDescriptionAr}</p>
        </div>

        <div className={styles.objectiveCard}>
          <small>هدف التواصل</small>
          <strong>{content.objectiveAr}</strong>
        </div>
      </section>

      <section className={styles.coachSection}>
        <article className={styles.coachCard}>
          <div className={styles.coachAvatar}>ب</div>

          <div className={styles.coachCopy}>
            <span>{coach.eyebrowAr}</span>
            <h2>{coach.titleAr}</h2>
            <p>{coach.messageAr}</p>

            {coach.reviewPhrase && (
              <div className={styles.reviewPhrase}>
                <small>عبارة المراجعة</small>
                <strong>{coach.reviewPhrase}</strong>
              </div>
            )}
          </div>

          {nextStage && (
            <Link
              href={`/learn/arabic-b/worlds/${content.id}/missions/${nextStage.id.split(":")[1]}`}
            >
              {coach.actionAr}
            </Link>
          )}
        </article>

        <article className={styles.memoryCard}>
          <span className={styles.memoryIcon}>◷</span>
          <div>
            <small>ذاكرة العالم</small>
            <strong>
              {progress === 0
                ? "هذه زيارتك الأولى"
                : `توقفت عند المرحلة ${Math.min(
                    completedCount + 1,
                    content.stages.length,
                  )}`}
            </strong>
            <p>
              سيحفظ بيان تقدمك ويعيدك إلى الخطوة المناسبة تلقائيًا.
            </p>
          </div>
        </article>
      </section>

      <section className={styles.storySection} id="story-path">
        <div className={styles.sectionHeading}>
          <div>
            <span>مسار القصة</span>
            <h2>تعلّم من خلال ما يحدث</h2>
          </div>
          <p>
            كل مرحلة تقرّبك من إنجاز المهمة الحياتية، بدل الانتقال
            بين دروس منفصلة.
          </p>
        </div>

        <div className={styles.stageGrid}>
          {content.stages.map((stage, index) => {
            const status = stageStatus(
              stage,
              index,
              state.completedStageIds,
            );

            return (
              <article
                className={`${styles.stageCard} ${
                  styles[`status_${status}`]
                }`}
                key={stage.id}
              >
                <div className={styles.stageTop}>
                  <span className={styles.stageIcon}>
                    {status === "completed" ? "✓" : stage.icon}
                  </span>
                  <small>المرحلة {index + 1}</small>
                  <strong>+{stage.xp} XP</strong>
                </div>

                <h3>{stage.titleAr}</h3>
                <p>{stage.descriptionAr}</p>

                <div className={styles.stageMeta}>
                  <span>◷ {stage.durationMinutes} دقائق</span>
                  <span>
                    {status === "completed"
                      ? "مكتملة"
                      : status === "locked"
                        ? "مغلقة"
                        : "جاهزة"}
                  </span>
                </div>

                {status !== "locked" && (
                  <div className={styles.stageActions}>
                    <Link
                      href={`/learn/arabic-b/worlds/${content.id}/missions/${stage.id.split(":")[1]}`}
                    >
                      {status === "completed"
                        ? "إعادة التدريب"
                        : "ابدأ المرحلة"}
                    </Link>

                    {status !== "completed" && (
                      <button
                        onClick={() => completeStage(stage)}
                        type="button"
                      >
                        تسجيل الإكمال
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.phrasesSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span>عبارات النجاة</span>
            <h2>ثلاث عبارات تنجز بها المهمة</h2>
          </div>
          <p>
            لا تحفظ قائمة طويلة؛ استخدم العبارات الأساسية داخل
            السياق أولًا.
          </p>
        </div>

        <div className={styles.phraseGrid}>
          {content.phrases.map((phrase, index) => (
            <article className={styles.phraseCard} key={phrase.arabic}>
              <span className={styles.phraseNumber}>
                {index + 1}
              </span>
              <h3>{phrase.arabic}</h3>
              <p className={styles.transliteration}>
                {phrase.transliteration}
              </p>
              <p>{phrase.english}</p>
              <small>{phrase.useAr}</small>
              <button type="button" aria-label="استمع إلى العبارة">
                🔊 استمع
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.rewardSection}>
        <article className={styles.checklistCard}>
          <span>متى تنجح في العالم؟</span>
          <h2>قائمة الجاهزية</h2>

          <div>
            {content.successChecklist.map((item) => (
              <p key={item}>
                <span>✓</span>
                {item}
              </p>
            ))}
          </div>
        </article>

        <article className={styles.badgeCard}>
          <div className={styles.badgeIcon}>🏅</div>
          <span>مكافأة العالم</span>
          <h2>{content.badgeAr}</h2>
          <p>{content.badgeEn}</p>
          <strong>+{content.rewardXp} XP</strong>
        </article>
      </section>

      <footer className={styles.footer}>
        <Link href="/learn/arabic-b">
          BAYAN Arabic World
        </Link>
        <span>
          يتكيف المسار مع تقدمك ويقترح الخطوة التالية تلقائيًا.
        </span>
      </footer>
    </main>
  );
}
