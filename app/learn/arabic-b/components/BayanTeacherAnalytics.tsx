"use client";

import { useMemo, useState } from "react";

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

type AnalyticsResponse = {
  learners: Learner[];
  eventCount: number;
};

export default function BayanTeacherAnalytics() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function loadAnalytics(): Promise<void> {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/bayan-platform/analytics", {
        cache: "no-store",
        headers: token
          ? { authorization: `Bearer ${token}` }
          : undefined,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as AnalyticsResponse;
      setLearners(data.learners);
      setEventCount(data.eventCount);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "تعذر تحميل التحليلات",
      );
    } finally {
      setLoading(false);
    }
  }

  const averagePronunciation = useMemo(() => {
    if (!learners.length) return 0;

    return Math.round(
      learners.reduce(
        (total, learner) => total + learner.pronunciationAverage,
        0,
      ) / learners.length,
    );
  }, [learners]);

  const completedMissions = useMemo(
    () =>
      learners.reduce(
        (total, learner) => total + learner.completedMissions,
        0,
      ),
    [learners],
  );

  return (
    <main className={styles.page}>
      <header>
        <div>
          <small>BAYAN Teacher Intelligence</small>
          <h1>تحليلات تعلم الطلاب</h1>
          <p>اضغط تحديث لتحميل أحدث بيانات الطلاب.</p>
        </div>

        <div className={styles.controls}>
          <input
            aria-label="Admin token"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Admin Token"
            type="password"
            value={token}
          />
          <button
            disabled={loading}
            onClick={() => void loadAnalytics()}
            type="button"
          >
            {loading ? "جارٍ التحميل…" : "تحديث"}
          </button>
        </div>
      </header>

      <section className={styles.metrics}>
        <article>
          <span>الطلاب</span>
          <strong>{learners.length}</strong>
        </article>
        <article>
          <span>الأحداث</span>
          <strong>{eventCount}</strong>
        </article>
        <article>
          <span>متوسط النطق</span>
          <strong>{averagePronunciation}%</strong>
        </article>
        <article>
          <span>المهام المكتملة</span>
          <strong>{completedMissions}</strong>
        </article>
      </section>

      {error ? <p role="alert">{error}</p> : null}

      <section className={styles.table}>
        <div className={styles.tableHeader}>
          <span>الطالب</span>
          <span>النطق</span>
          <span>المتوسط</span>
          <span>المحاولات</span>
          <span>المهام</span>
          <span>الضعف</span>
          <span>الزمن</span>
        </div>

        {learners.map((learner) => (
          <article key={learner.learnerId}>
            <span>
              <strong>{learner.learnerName}</strong>
              <small>{learner.learnerId}</small>
            </span>
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
