"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import JourneyIcon from "./JourneyIcon";
import JourneyNode from "./JourneyNode";
import JourneyPath from "./JourneyPath";
import { journeyStops, type JourneyStop } from "./journey-data";
import styles from "./JourneyMap.module.css";

type JourneyMapProps = {
  isArabic: boolean;
};

export default function JourneyMap({ isArabic }: JourneyMapProps) {
  const [selectedStop, setSelectedStop] =
    useState<JourneyStop | null>(null);

  const completedStops = useMemo(
    () =>
      journeyStops.filter((stop) => stop.status === "completed")
        .length,
    [],
  );

  const currentStop = useMemo(
    () =>
      journeyStops.find((stop) => stop.status === "current") ??
      journeyStops[0],
    [],
  );

  useEffect(() => {
    if (!selectedStop) return;

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedStop(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [selectedStop]);

  return (
    <section
      id="journey"
      className={styles.journey}
      aria-labelledby="journey-map-title"
    >
      <div className={styles.ambient} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={styles.sectionIntro}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65 }}
        >
          <span className={styles.eyebrow}>
            <span aria-hidden="true">✦</span>
            {isArabic
              ? "رحلة واقعية من الكلمات الأولى إلى الطلاقة"
              : "A real-life path from first words to fluency"}
          </span>

          <h2 id="journey-map-title">
            {isArabic ? (
              <>
                لا تدرس مستوى فقط.
                <span> عِش رحلة عربية.</span>
              </>
            ) : (
              <>
                Don&apos;t just study levels.
                <span> Live the journey.</span>
              </>
            )}
          </h2>

          <p>
            {isArabic
              ? "كل محطة تضعك في موقف حقيقي، وتمنحك اللغة التي تحتاج إليها للاستماع والتحدث والتفاعل بثقة."
              : "Every stop places you in a real situation and gives you the Arabic you need to listen, speak and respond with confidence."}
          </p>
        </motion.div>

        <motion.div
          className={styles.journeySummary}
          initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <span className={styles.passportIcon} aria-hidden="true">
            ب
          </span>

          <span>
            <small>
              {isArabic ? "جواز رحلة بيان" : "BAYAN journey passport"}
            </small>
            <strong>
              {isArabic
                ? currentStop.titleAr
                : currentStop.titleEn}
            </strong>
          </span>

          <div className={styles.summaryStats}>
            <span>
              <b>{completedStops}</b>
              <small>{isArabic ? "مكتملة" : "completed"}</small>
            </span>

            <span>
              <b>860</b>
              <small>XP</small>
            </span>

            <span>
              <b>12</b>
              <small>{isArabic ? "يومًا" : "days"}</small>
            </span>
          </div>

          <div className={styles.summaryProgress}>
            <span>
              <small>
                {isArabic ? "تقدم الرحلة" : "Journey progress"}
              </small>
              <b>22%</b>
            </span>

            <span>
              <span style={{ width: "22%" }} />
            </span>
          </div>
        </motion.div>
      </div>

      <div className={styles.mapShell}>
        <div className={styles.mapLegend}>
          <span>
            <i className={styles.legendCompleted} />
            {isArabic ? "مكتملة" : "Completed"}
          </span>

          <span>
            <i className={styles.legendCurrent} />
            {isArabic ? "المحطة الحالية" : "Current"}
          </span>

          <span>
            <i className={styles.legendLocked} />
            {isArabic ? "قادمة" : "Upcoming"}
          </span>
        </div>

        <div className={styles.map}>
          <div className={styles.mapCenterLine} aria-hidden="true" />

          {journeyStops.map((stop, index) => (
            <div key={stop.id} className={styles.mapStage}>
              <JourneyNode
                stop={stop}
                index={index}
                isArabic={isArabic}
                onSelect={setSelectedStop}
              />

              {index < journeyStops.length - 1 && (
                <JourneyPath
                  completed={
                    stop.status === "completed" &&
                    journeyStops[index + 1].status !== "locked"
                  }
                  active={stop.status === "current"}
                />
              )}

              {index === 2 && (
                <motion.div
                  className={styles.achievement}
                  initial={{ opacity: 0, scale: 0.86 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{ duration: 0.55 }}
                >
                  <span aria-hidden="true">🏅</span>
                  <span>
                    <small>
                      {isArabic
                        ? "شارة في الطريق"
                        : "Badge on the path"}
                    </small>
                    <strong>
                      {isArabic
                        ? "متحدث الحياة اليومية"
                        : "Everyday Speaker"}
                    </strong>
                  </span>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.journeyFooter}>
        <span>
          <b>7</b>
          {isArabic ? " مواقف حياتية" : " real-life worlds"}
        </span>

        <span>
          <b>36</b>
          {isArabic ? " محادثة ذكية" : " AI conversations"}
        </span>

        <span>
          <b>582</b>
          {isArabic ? " كلمة في السياق" : " words in context"}
        </span>

        <a href="#mission">
          {isArabic ? "ابدأ مهمة اليوم" : "Start today's mission"}
          <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
        </a>
      </div>

      <AnimatePresence>
        {selectedStop && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedStop(null);
              }
            }}
          >
            <motion.div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="journey-stop-title"
              initial={{ opacity: 0, y: 38, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 26, scale: 0.97 }}
              transition={{ duration: 0.32 }}
              style={
                {
                  "--node-color": selectedStop.color,
                  "--node-glow": selectedStop.glow,
                } as React.CSSProperties
              }
            >
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setSelectedStop(null)}
                aria-label={
                  isArabic ? "إغلاق النافذة" : "Close dialog"
                }
              >
                ×
              </button>

              <div className={styles.modalHero}>
                <span className={styles.modalIcon}>
                  <JourneyIcon name={selectedStop.icon} />
                </span>

                <span>
                  <small>
                    {selectedStop.level} ·{" "}
                    {selectedStop.status === "completed"
                      ? isArabic
                        ? "مكتملة"
                        : "Completed"
                      : selectedStop.status === "current"
                        ? isArabic
                          ? "محطتك الحالية"
                          : "Your current stop"
                        : isArabic
                          ? "محطة قادمة"
                          : "Upcoming stop"}
                  </small>

                  <h3 id="journey-stop-title">
                    {isArabic
                      ? selectedStop.titleAr
                      : selectedStop.titleEn}
                  </h3>

                  <p>
                    {isArabic
                      ? selectedStop.descriptionAr
                      : selectedStop.descriptionEn}
                  </p>
                </span>
              </div>

              <div className={styles.modalMetrics}>
                <span>
                  <b>{selectedStop.words}</b>
                  <small>{isArabic ? "كلمة" : "words"}</small>
                </span>

                <span>
                  <b>{selectedStop.conversations}</b>
                  <small>
                    {isArabic ? "محادثات" : "conversations"}
                  </small>
                </span>

                <span>
                  <b>{selectedStop.xp}</b>
                  <small>XP</small>
                </span>
              </div>

              <div className={styles.modalMissions}>
                <small>
                  {isArabic
                    ? "ما الذي ستتمكن من فعله؟"
                    : "What will you be able to do?"}
                </small>

                <ul>
                  {(isArabic
                    ? selectedStop.missionsAr
                    : selectedStop.missionsEn
                  ).map((mission) => (
                    <li key={mission}>
                      <span aria-hidden="true">✓</span>
                      {mission}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  disabled={selectedStop.status === "locked"}
                >
                  <span aria-hidden="true">🎙</span>
                  {selectedStop.status === "completed"
                    ? isArabic
                      ? "راجع المحادثة"
                      : "Review conversation"
                    : selectedStop.status === "current"
                      ? isArabic
                        ? "ابدأ المحادثة"
                        : "Start conversation"
                      : isArabic
                        ? "أكمل المحطة السابقة أولًا"
                        : "Complete the previous stop"}
                </button>

                <button
                  type="button"
                  className={styles.secondaryModalAction}
                  onClick={() => setSelectedStop(null)}
                >
                  {isArabic ? "العودة إلى الخريطة" : "Back to map"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
