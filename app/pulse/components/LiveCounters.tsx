"use client";

import { useEffect, useState } from "react";
import styles from "../pulse-living.module.css";

type Counters = {
  stories: number;
  posts: number;
  events: number;
  achievements: number;
};

const fallback: Counters = { stories: 8, posts: 24, events: 3, achievements: 6 };

export default function LiveCounters() {
  const [counters, setCounters] = useState<Counters>(fallback);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/pulse/live", { cache: "no-store" });
        if (!response.ok) throw new Error("Live counters failed");
        const payload = await response.json();
        if (active && payload.counters) {
          setCounters(payload.counters);
          setConnected(true);
        }
      } catch {
        if (active) setConnected(false);
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const entries = [
    ["قصص اليوم", counters.stories],
    ["تحديثات النبض", counters.posts],
    ["فعاليات اليوم", counters.events],
    ["إنجازات جديدة", counters.achievements],
  ];

  return (
    <section className={styles.liveCounters} aria-label="إحصاءات نبض بيان المباشرة">
      <div className={styles.liveCountersStatus}>
        <i className={connected ? styles.connectedDot : styles.standbyDot} />
        <span>{connected ? "متصل مباشرة" : "آخر بيانات متاحة"}</span>
      </div>
      <div className={styles.counterGrid}>
        {entries.map(([label, value]) => (
          <article className={styles.counterCard} key={String(label)}>
            <strong>{Number(value).toLocaleString("ar-QA")}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
