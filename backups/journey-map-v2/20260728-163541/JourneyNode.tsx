"use client";

import { motion } from "framer-motion";
import JourneyIcon from "./JourneyIcon";
import styles from "./JourneyMap.module.css";
import type { JourneyStop } from "./journey-data";

type JourneyNodeProps = {
  stop: JourneyStop;
  index: number;
  isArabic: boolean;
  onSelect: (stop: JourneyStop) => void;
};

export default function JourneyNode({
  stop,
  index,
  isArabic,
  onSelect,
}: JourneyNodeProps) {
  const locked = stop.status === "locked";
  const current = stop.status === "current";
  const completed = stop.status === "completed";

  return (
    <motion.article
      className={`${styles.nodeRow} ${
        index % 2 === 0 ? styles.nodeLeft : styles.nodeRight
      }`}
      initial={{ opacity: 0, y: 54, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.32),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        type="button"
        className={`${styles.nodeCard} ${
          completed ? styles.nodeCompleted : ""
        } ${current ? styles.nodeCurrent : ""} ${
          locked ? styles.nodeLocked : ""
        }`}
        onClick={() => onSelect(stop)}
        aria-label={
          isArabic
            ? `فتح محطة ${stop.titleAr}`
            : `Open ${stop.titleEn} journey stop`
        }
        style={
          {
            "--node-color": stop.color,
            "--node-glow": stop.glow,
          } as React.CSSProperties
        }
      >
        <span className={styles.nodeTopline}>
          <span className={styles.levelBadge}>{stop.level}</span>

          <span className={styles.nodeStatus}>
            {completed && (
              <>
                <span aria-hidden="true">✓</span>
                {isArabic ? "مكتملة" : "Completed"}
              </>
            )}

            {current && (
              <>
                <span className={styles.liveDot} aria-hidden="true" />
                {isArabic ? "محطتك الحالية" : "Current stop"}
              </>
            )}

            {locked && (
              <>
                <span aria-hidden="true">⌁</span>
                {isArabic ? "مقفلة" : "Locked"}
              </>
            )}
          </span>
        </span>

        <span className={styles.nodeMain}>
          <span className={styles.nodeIconShell}>
            <JourneyIcon name={stop.icon} />

            {current && (
              <span className={styles.nodePulse} aria-hidden="true" />
            )}
          </span>

          <span className={styles.nodeCopy}>
            <strong>{isArabic ? stop.titleAr : stop.titleEn}</strong>
            <small>
              {isArabic ? stop.subtitleAr : stop.subtitleEn}
            </small>
          </span>
        </span>

        <span className={styles.nodeStats}>
          <span>
            <b>{stop.words}</b>
            <small>{isArabic ? "كلمة" : "words"}</small>
          </span>

          <span>
            <b>{stop.conversations}</b>
            <small>{isArabic ? "حوارات" : "talks"}</small>
          </span>

          <span>
            <b>{stop.xp}</b>
            <small>XP</small>
          </span>
        </span>

        <span className={styles.nodeProgress}>
          <span>
            <b>
              {current
                ? isArabic
                  ? "تقدمك"
                  : "Your progress"
                : completed
                  ? isArabic
                    ? "اكتمل المسار"
                    : "Path completed"
                  : isArabic
                    ? "أكمل المحطة السابقة"
                    : "Complete previous stop"}
            </b>

            <small>{stop.progress}%</small>
          </span>

          <span className={styles.nodeProgressTrack}>
            <span
              className={styles.nodeProgressFill}
              style={{ width: `${stop.progress}%` }}
            />
          </span>
        </span>

        <span className={styles.nodeAction}>
          {completed
            ? isArabic
              ? "راجع المحطة"
              : "Review stop"
            : current
              ? isArabic
                ? "تابع الرحلة"
                : "Continue journey"
              : isArabic
                ? "استكشف المحطة"
                : "Explore stop"}

          <span aria-hidden="true">
            {isArabic ? "←" : "→"}
          </span>
        </span>
      </button>
    </motion.article>
  );
}
