"use client";

import { useState } from "react";
import styles from "../pulse-polish.module.css";

export default function ProgressiveImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${styles.imageFallback} ${className}`} role="img" aria-label={alt}>
        <span>ب</span>
      </div>
    );
  }

  return (
    <span className={`${styles.progressiveWrap} ${loaded ? styles.progressiveLoaded : ""} ${className}`}>
      <span className={styles.progressiveBlur} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
