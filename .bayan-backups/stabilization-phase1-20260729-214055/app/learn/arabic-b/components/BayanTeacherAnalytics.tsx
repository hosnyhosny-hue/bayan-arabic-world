"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "../bayan-analytics.module.css";

type Learner = {
  learnerId: string;
  learnerName: string;
  attempts: number;
  completedMissions: number;
  averageScore: number;
  pronunciationAverage: number;
  totalSeconds: number;
  weakestSkill: string;
};

export default function BayanTeacherAnalytics() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  async function load(): Promise<void> {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/bayan-platform/analytics", {
        cache: "no-store",
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json() as {
        learners: Learner[];
        eventCount: number;
      };
      setLearners(data.learners);
      setEventCount(data.eventCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avg = useMemo(
    () =>
      learners.length
        ? Math.round(
            learners.reduce(
              (sum, learner) => sum + learner.pronunciationAverage,
              0,
            ) / learners.length,
          )
        : 0,
    [learners],
  );

  return (
    <main className={styles.page}>
      <header>
        <div>
          <small>BAYAN Teacher Intelligence</small>
          <h1>تحليلات تعلم الطلاب</h1>
        </div>
        <div className={styles.controls}>
          <input
            placeholder="Admin Token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <button onClick={() => void load()} type="button">
            {loading ? "جارٍ التحميل…" : "تحديث"}
          </button>
        </div>
      </header>

      <section className={styles.metrics}>
        <article><span>الطلاب</span><strong>{learners.length}</strong></article>
        <article><span>الأحداث</span><strong>{eventCount}</strong></article>
        <article><span>متوسط النطق</span><strong>{avg}%</strong></article>
        <article>
          <span>المهام المكتملة</span>
          <strong>
            {learners.reduce(
              (sum, learner) => sum + learner.completedMissions,
              0,
            )}
          </strong>
        </article>
      </section>

      <section className={styles.table}>
        <div className={styles.tableHeader}>
          <span>الطالب</span><span>النطق</span><span>المتوسط</span>
          <span>المحاولات</span><span>المهام</span><span>الضعف</span>
          <span>الزمن</span>
        </div>
        {learners.map((learner) => (
          <article key={learner.learnerId}>
            <span><strong>{learner.learnerName}</strong><small>{learner.learnerId}</small></span>
            <span>{learner.pronunciationAverage}%</span>
            <span>{learner.averageScore}%</span>
            <span>{learner.attempts}</span>
            <span>{learner.completedMissions}</span>
            <span>{learner.weakestSkill}</span>
            <span>{Math.round(learner.totalSeconds / 60)} د</span>
          </article>
        ))}
      </section>
    </main>
  );
}
