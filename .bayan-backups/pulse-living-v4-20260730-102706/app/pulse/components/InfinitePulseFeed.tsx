"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProgressiveImage from "./ProgressiveImage";
import { EmptyState, ErrorState } from "./ExperienceState";
import styles from "../pulse-polish.module.css";

type PulseItem = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  publishedAt?: string;
};

const fallbackItems: PulseItem[] = [
  {
    id: "fallback-1",
    title: "صوت الطلاب يملأ اليوم بالحياة",
    excerpt: "لقطات من أنشطة اللغة العربية ومشروعات الطلاب داخل المدرسة.",
    image: "/images/bayan/pulse-feed-1.jpg",
    category: "داخل الصف",
  },
  {
    id: "fallback-2",
    title: "الاستعدادات النهائية لـ Arabic Bee",
    excerpt: "فرق الطلاب تستعد للجولة القادمة من المسابقة.",
    image: "/images/bayan/pulse-feed-2.jpg",
    category: "Arabic Bee",
  },
  {
    id: "fallback-3",
    title: "مشروعات تروي قصص الهوية",
    excerpt: "أعمال طلابية تجمع البحث والإبداع واللغة.",
    image: "/images/bayan/pulse-feed-3.jpg",
    category: "إنجازات",
  },
];

export default function InfinitePulseFeed() {
  const [items, setItems] = useState<PulseItem[]>(fallbackItems);
  const [cursor, setCursor] = useState<string | null>("initial");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    setFailed(false);

    try {
      const response = await fetch(`/api/pulse/feed?cursor=${encodeURIComponent(cursor)}&limit=6`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Feed request failed");

      const payload = await response.json() as {
        items?: PulseItem[];
        nextCursor?: string | null;
      };

      const nextItems = Array.isArray(payload.items) ? payload.items : [];
      if (nextItems.length) {
        setItems((current) => {
          const ids = new Set(current.map((item) => item.id));
          return [...current, ...nextItems.filter((item) => !ids.has(item.id))];
        });
      }
      setCursor(payload.nextCursor || null);
    } catch {
      setFailed(true);
      setCursor(null);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "500px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loadMore]);

  if (!items.length && !loading && !failed) {
    return <EmptyState title="النبض هادئ الآن" description="لا توجد منشورات جديدة، عد لاحقًا لاكتشاف ما يحدث." />;
  }

  return (
    <div className={styles.feedWrap}>
      <div className={styles.feedGrid}>
        {items.map((item, index) => (
          <article className={`${styles.feedCard} ${index % 5 === 0 ? styles.feedCardWide : ""}`} key={item.id}>
            <ProgressiveImage src={item.image} alt={item.title} className={styles.feedImage} />
            <div className={styles.feedOverlay} />
            <div className={styles.feedContent}>
              <span>{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
            </div>
          </article>
        ))}
      </div>

      {loading && (
        <div className={styles.feedLoading} aria-label="جاري تحميل المزيد">
          <i /><i /><i />
        </div>
      )}

      {failed && <ErrorState title="تعذر تحميل المزيد" description="المحتوى الحالي ما زال متاحًا، ويمكنك إعادة المحاولة لاحقًا." />}

      {!cursor && !failed && (
        <div className={styles.feedEnd}>
          <span>✓</span>
          <strong>وصلت إلى نهاية إصدار اليوم</strong>
        </div>
      )}

      <div ref={sentinel} className={styles.sentinel} aria-hidden="true" />
    </div>
  );
}
