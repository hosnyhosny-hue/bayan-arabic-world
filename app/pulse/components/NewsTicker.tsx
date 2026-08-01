"use client";

import { useEffect, useState } from "react";
import styles from "../pulse-living.module.css";

const fallback = [
  "بدء الجولة الجديدة من Arabic Bee",
  "إضافة إنجازات طلاب الأسبوع",
  "فتح التسجيل في معرض اللغة العربية",
  "صور جديدة من أنشطة الصفوف",
];

export default function NewsTicker() {
  const [items, setItems] = useState(fallback);

  useEffect(() => {
    fetch("/api/pulse/ticker", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (Array.isArray(payload?.items) && payload.items.length) setItems(payload.items);
      })
      .catch(() => undefined);
  }, []);

  const repeated = [...items, ...items];

  return (
    <section className={styles.ticker} aria-label="آخر أخبار نبض بيان">
      <div className={styles.tickerLabel}><i/> الآن في بيان</div>
      <div className={styles.tickerViewport}>
        <div className={styles.tickerTrack}>
          {repeated.map((item, index) => (
            <span key={`${item}-${index}`}>{item}<b>•</b></span>
          ))}
        </div>
      </div>
    </section>
  );
}
