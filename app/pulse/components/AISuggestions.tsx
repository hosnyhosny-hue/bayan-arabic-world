"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../pulse-living.module.css";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  href: string;
  label: string;
};

const fallback: Suggestion[] = [
  { id: "1", title: "ابدأ بإصدار اليوم", description: "مختارات سريعة لأهم ما حدث داخل المدرسة.", href: "#today", label: "موصى به" },
  { id: "2", title: "تابع فعاليات اليوم", description: "الأوقات والأماكن وأحدث التحديثات.", href: "#events", label: "حسب الوقت" },
  { id: "3", title: "اكتشف Arabic Bee", description: "قصص المسابقة والطلاب المشاركون.", href: "#stories", label: "رائج" },
];

export default function AISuggestions() {
  const [items, setItems] = useState(fallback);
  const [reason, setReason] = useState("مختارات مخصصة وفق وقت اليوم والمحتوى الأحدث.");

  useEffect(() => {
    fetch("/api/pulse/recommendations", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (Array.isArray(payload?.items) && payload.items.length) setItems(payload.items);
        if (typeof payload?.reason === "string") setReason(payload.reason);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className={styles.aiSuggestions}>
      <header>
        <div><span>AI FOR YOU</span><h2>ماذا تقرأ الآن؟</h2></div>
        <p>{reason}</p>
      </header>
      <div className={styles.suggestionGrid}>
        {items.map((item, index) => (
          <Link className={styles.suggestionCard} href={item.href} key={item.id}>
            <span className={styles.suggestionNumber}>{String(index + 1).padStart(2, "0")}</span>
            <small>{item.label}</small>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <b>استكشف ←</b>
          </Link>
        ))}
      </div>
    </section>
  );
}
