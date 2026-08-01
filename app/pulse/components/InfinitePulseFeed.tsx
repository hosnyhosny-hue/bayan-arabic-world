"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ProgressiveImage from "./ProgressiveImage";
import {
  EmptyState,
  ErrorState,
} from "./ExperienceState";
import styles from "../pulse-polish.module.css";

type PulseItem = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  channel?: string;
  type?: string;
  locale?: string;
  mediaUrl?: string;
  mediaType?: "image" | "pdf" | "video" | string;
  publishedAt?: string | null;
};

const fallbackItems: PulseItem[] = [
  {
    id: "fallback-1",
    title: "صوت الطلاب يملأ اليوم بالحياة",
    excerpt:
      "لقطات من أنشطة اللغة العربية ومشروعات الطلاب داخل المدرسة.",
    image: "/images/bayan/pulse-feed-1.jpg",
    category: "داخل الصف",
    channel: "arabic",
  },
  {
    id: "fallback-2",
    title: "الاستعدادات النهائية لـ Arabic Bee",
    excerpt:
      "فرق الطلاب تستعد للجولة القادمة من المسابقة.",
    image: "/images/bayan/pulse-feed-2.jpg",
    category: "Arabic Bee",
    channel: "arabic-bee",
  },
  {
    id: "fallback-3",
    title: "مشروعات تروي قصص الهوية",
    excerpt:
      "أعمال طلابية تجمع البحث والإبداع واللغة.",
    image: "/images/bayan/pulse-feed-3.jpg",
    category: "إنجازات",
    channel: "achievements",
  },
];

function getItemLabel(item: PulseItem): string {
  if (item.mediaType === "pdf" || item.type === "magazine") {
    return "مجلة رقمية";
  }

  if (item.mediaType === "video" || item.type === "video") {
    return "فيديو";
  }

  if (item.type === "event") {
    return "فعالية";
  }

  if (item.type === "achievement") {
    return "إنجاز";
  }

  return item.category || "نبض بيان";
}

function isFallbackItem(item: PulseItem): boolean {
  return item.id.startsWith("fallback-");
}

export default function InfinitePulseFeed() {
  const [items, setItems] =
    useState<PulseItem[]>(fallbackItems);

  const [cursor, setCursor] =
    useState<string | null>("initial");

  const [channel, setChannel] =
    useState("all");

  const [loading, setLoading] =
    useState(false);

  const [failed, setFailed] =
    useState(false);

  const sentinel =
    useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(
    async (reset = false) => {
      if (loading || (!cursor && !reset)) {
        return;
      }

      setLoading(true);
      setFailed(false);

      try {
        const activeCursor = reset
          ? "initial"
          : cursor;

        const query = new URLSearchParams({
          cursor: activeCursor || "initial",
          limit: "6",
          channel,
          locale: "ar",
        });

        const response = await fetch(
          `/api/pulse/feed?${query.toString()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Pulse feed request failed");
        }

        const payload = await response.json();

        const next: PulseItem[] =
          Array.isArray(payload.items)
            ? payload.items
            : [];

        setItems((current) => {
          if (reset) {
            return next;
          }

          return [
            ...current,
            ...next.filter(
              (item) =>
                !current.some(
                  (existing) =>
                    existing.id === item.id
                )
            ),
          ];
        });

        setCursor(payload.nextCursor || null);
      } catch (error) {
        console.error(
          "[InfinitePulseFeed]",
          error
        );

        setFailed(true);
        setCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [channel, cursor, loading]
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const value =
        (event as CustomEvent<string>).detail ||
        "all";

      setChannel(value);
      setCursor("initial");
    };

    window.addEventListener(
      "bayan-channel-change",
      handler
    );

    return () =>
      window.removeEventListener(
        "bayan-channel-change",
        handler
      );
  }, []);

  useEffect(() => {
    void loadMore(true);
  }, [channel]);

  useEffect(() => {
    const element = sentinel.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            void loadMore(false);
          }
        },
        {
          rootMargin: "500px 0px",
        }
      );

    observer.observe(element);

    return () => observer.disconnect();
  }, [loadMore]);

  if (!items.length && !loading && !failed) {
    return (
      <EmptyState
        title="لا يوجد محتوى في هذه القناة"
        description="سنضيف المحتوى الجديد هنا فور نشره."
      />
    );
  }

  return (
    <div className={styles.feedWrap}>
      <div className={styles.feedGrid}>
        {items.map((item, index) => {
          const card = (
            <>
              <ProgressiveImage
                src={
                  item.image ||
                  "/images/bayan/pulse-feed-1.jpg"
                }
                alt={item.title}
                className={styles.feedImage}
              />

              <div
                className={styles.feedOverlay}
              />

              <div
                className={styles.feedContent}
              >
                <span>
                  {getItemLabel(item)}
                </span>

                <h3>{item.title}</h3>

                {item.excerpt ? (
                  <p>{item.excerpt}</p>
                ) : null}

                {!isFallbackItem(item) ? (
                  <b
                    className={
                      styles.feedOpenHint
                    }
                  >
                    {item.mediaType === "pdf"
                      ? "فتح المجلة ←"
                      : "عرض التفاصيل ←"}
                  </b>
                ) : null}
              </div>
            </>
          );

          const className = [
            styles.feedCard,
            index % 5 === 0
              ? styles.feedCardWide
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          if (isFallbackItem(item)) {
            return (
              <article
                className={className}
                key={item.id}
              >
                {card}
              </article>
            );
          }

          return (
            <Link
              href={`/pulse/${encodeURIComponent(
                item.id
              )}`}
              className={className}
              key={item.id}
              aria-label={`فتح ${item.title}`}
            >
              {card}
            </Link>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.feedLoading}>
          <i />
          <i />
          <i />
        </div>
      ) : null}

      {failed ? (
        <ErrorState
          title="تعذر تحميل المزيد"
          description="المحتوى الحالي ما زال متاحًا."
        />
      ) : null}

      <div
        ref={sentinel}
        className={styles.sentinel}
      />
    </div>
  );
}
