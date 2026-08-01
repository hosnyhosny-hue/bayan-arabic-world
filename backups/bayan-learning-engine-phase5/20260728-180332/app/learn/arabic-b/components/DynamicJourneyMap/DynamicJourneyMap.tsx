"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useJourneyEngine } from "../../engine/core/JourneyEngineProvider";
import type { WorldId, WorldStatus } from "../../engine/core/types";
import { JOURNEY_WORLD_UI_REGISTRY } from "../../engine/worlds/generated-ui-registry";
import styles from "./dynamic-journey-map.module.css";

type Props = {
  isArabic?: boolean;
};

const statusLabels: Record<WorldStatus, { en: string; ar: string }> = {
  locked: { en: "Locked", ar: "مغلق" },
  available: { en: "Available", ar: "متاح" },
  active: { en: "In progress", ar: "قيد التعلّم" },
  completed: { en: "Completed", ar: "مكتمل" },
};

export default function DynamicJourneyMap({ isArabic = false }: Props) {
  const engine = useJourneyEngine();
  const router = useRouter();
  const locale = isArabic ? "ar" : "en";

  const worlds = useMemo(
    () =>
      JOURNEY_WORLD_UI_REGISTRY.map((world) => {
        const progress = engine.state.worlds[world.id];
        return {
          ...world,
          progress,
          percentage: engine.getWorldProgress(world.id),
        };
      }),
    [engine],
  );

  const handleWorldAction = (worldId: WorldId, status: WorldStatus) => {
    if (status === "locked") return;

    if (status === "available") {
      engine.startWorld(worldId);
    } else {
      engine.setActiveWorld(worldId);
    }

    router.push(`/learn/arabic-b/worlds/${worldId}`);
  };

  return (
    <section
      className={styles.section}
      dir={isArabic ? "rtl" : "ltr"}
      aria-labelledby="journey-map-heading"
    >
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            {isArabic ? "رحلة بيان" : "BAYAN Journey"}
          </span>
          <h2 id="journey-map-heading">
            {isArabic ? "عوالم العربية التفاعلية" : "Interactive Arabic Worlds"}
          </h2>
          <p>
            {isArabic
              ? "تقدّمك وحالة العوالم والمهمات تُقرأ مباشرة من محرك التعلّم."
              : "Progress, world status, and missions are rendered directly from the learning engine."}
          </p>
        </div>

        <div className={styles.summary}>
          <div>
            <strong>{engine.journeyProgress}%</strong>
            <span>{isArabic ? "إنجاز الرحلة" : "Journey progress"}</span>
          </div>
          <div>
            <strong>{engine.state.totalXp}</strong>
            <span>XP</span>
          </div>
          <div>
            <strong>{engine.state.badges.length}</strong>
            <span>{isArabic ? "شارات" : "Badges"}</span>
          </div>
        </div>
      </header>

      <div
        className={styles.overallProgress}
        aria-label={
          isArabic
            ? `إنجاز الرحلة ${engine.journeyProgress}%`
            : `Journey progress ${engine.journeyProgress}%`
        }
      >
        <span style={{ width: `${engine.journeyProgress}%` }} />
      </div>

      <div className={styles.grid}>
        {worlds.map((world, index) => {
          const status = world.progress.status;
          const title = world.title[locale];
          const description = world.description[locale];
          const badge = world.badge[locale];

          return (
            <article
              key={world.id}
              className={`${styles.card} ${styles[status]}`}
              data-world-id={world.id}
            >
              <div className={styles.cardTop}>
                <span className={styles.order}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.icon} aria-hidden="true">
                  {world.icon}
                </span>
                <span className={styles.status}>
                  {statusLabels[status][locale]}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.titleRow}>
                  <div>
                    <span className={styles.level}>{world.level}</span>
                    <h3>{title}</h3>
                  </div>
                  <strong className={styles.percentage}>
                    {world.percentage}%
                  </strong>
                </div>

                {description ? <p>{description}</p> : null}

                <dl className={styles.metrics}>
                  <div>
                    <dt>{isArabic ? "المهمات" : "Missions"}</dt>
                    <dd>{world.missionCount}</dd>
                  </div>
                  <div>
                    <dt>{isArabic ? "المفردات" : "Vocabulary"}</dt>
                    <dd>{world.vocabularyCount}</dd>
                  </div>
                  <div>
                    <dt>{isArabic ? "المشاهد" : "Scenes"}</dt>
                    <dd>{world.sceneCount}</dd>
                  </div>
                  <div>
                    <dt>XP</dt>
                    <dd>{world.xpReward}</dd>
                  </div>
                </dl>

                <div className={styles.progress}>
                  <span style={{ width: `${world.percentage}%` }} />
                </div>

                <div className={styles.progressCaption}>
                  <span>
                    {world.progress.completedMissionIds.length}/
                    {world.missionCount} {isArabic ? "مهمات" : "missions"}
                  </span>
                  {badge ? (
                    <span className={styles.badge}>🏅 {badge}</span>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className={styles.action}
                disabled={status === "locked"}
                onClick={() => handleWorldAction(world.id, status)}
              >
                {status === "locked"
                  ? isArabic
                    ? "أكمل العالم السابق"
                    : "Complete previous world"
                  : status === "available"
                    ? isArabic
                      ? "ابدأ العالم"
                      : "Start world"
                    : status === "completed"
                      ? isArabic
                        ? "راجع العالم"
                        : "Review world"
                      : isArabic
                        ? "تابع التعلّم"
                        : "Continue learning"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
