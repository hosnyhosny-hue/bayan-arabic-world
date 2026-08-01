"use client";

import { useEffect, useState } from "react";
import styles from "../pulse-main.module.css";
import living from "../pulse-living.module.css";
import { EmptyState } from "./ExperienceState";

type EventItem = {
  id: string;
  time: string;
  title: string;
  place: string;
  status: string;
  isNow?: boolean;
};

const fallback: EventItem[] = [
  { id: "1", time: "08:00", title: "تحدي Arabic Bee", place: "المسرح الرئيسي", status: "مباشر", isNow: true },
  { id: "2", time: "10:30", title: "عرض مشاريع الطلاب", place: "مركز التعلم", status: "اليوم" },
  { id: "3", time: "13:00", title: "لقاء أولياء الأمور", place: "قاعة المجتمع", status: "قريبًا" },
];

export default function TodayEvents() {
  const [items, setItems] = useState(fallback);

  useEffect(() => {
    fetch("/api/pulse/events", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (Array.isArray(payload?.items)) setItems(payload.items);
      })
      .catch(() => undefined);
  }, []);

  if (!items.length) {
    return <EmptyState title="لا توجد فعاليات اليوم" description="سنضيف أي فعالية جديدة هنا فور اعتمادها." />;
  }

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineTabs}>
        <button className={`${styles.day} ${styles.dayActive}`}>اليوم</button>
        <button className={styles.day}>غدًا</button>
        <button className={styles.day}>هذا الأسبوع</button>
      </div>
      <div className={styles.timelineList}>
        {items.map((event) => (
          <article className={`${styles.timelineItem} ${event.isNow ? living.eventNow : ""}`} key={event.id}>
            <div className={styles.time}><strong>{event.time}</strong><small>بتوقيت الدوحة</small></div>
            <div className={styles.timelineCopy}><h3>{event.title}</h3><p>{event.place}</p></div>
            <span className={`${styles.status} ${event.isNow ? living.liveEventStatus : ""}`}>{event.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
