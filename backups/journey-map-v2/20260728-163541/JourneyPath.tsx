"use client";

import { motion } from "framer-motion";
import styles from "./JourneyMap.module.css";

type JourneyPathProps = {
  completed: boolean;
  active: boolean;
};

export default function JourneyPath({
  completed,
  active,
}: JourneyPathProps) {
  return (
    <div className={styles.pathSegment} aria-hidden="true">
      <span className={styles.pathBase} />

      <motion.span
        className={`${styles.pathProgress} ${
          active ? styles.pathProgressActive : ""
        }`}
        initial={{ scaleY: 0 }}
        whileInView={{
          scaleY: completed ? 1 : active ? 0.56 : 0,
        }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      />

      <span className={styles.pathDot} />
      <span className={styles.pathDot} />
      <span className={styles.pathDot} />
    </div>
  );
}
