"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./PublicCmsCollectionPage.module.css";

type CmsItem = {
  id: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug?: string;
  mediaName?: string;
  mediaUrl?: string;
  mediaType?: string;
  url?: string;
  category?: string;
  author?: string;
  date?: string;
  eventDate?: string;
};

type Props = {
  section: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  icon?: string;
};

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

function isImage(type = "", url = "") {
  return (
    type.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(url)
  );
}

function isVideo(type = "", url = "") {
  return (
    type.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
  );
}

function isAudio(type = "", url = "") {
  return (
    type.startsWith("audio/") ||
    /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(url)
  );
}

function isPdf(type = "", url = "") {
  return (
    type === "application/pdf" ||
    /\.pdf(\?|$)/i.test(url)
  );
}

function destination(item: CmsItem) {
  return item.mediaUrl || item.url || "";
}

function MediaPreview({ item }: { item: CmsItem }) {
  const url = item.mediaUrl || "";
  const type = item.mediaType || "";

  if (!url) {
    return (
      <div className={styles.placeholder}>
        <span>ب</span>
        <small>BAYAN</small>
      </div>
    );
  }

  if (isImage(type, url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={styles.coverImage}
        src={url}
        alt={item.titleAr || item.mediaName || ""}
      />
    );
  }

  if (isVideo(type, url)) {
    return (
      <video
        className={styles.video}
        src={url}
        controls
        preload="metadata"
      />
    );
  }

  if (isAudio(type, url)) {
    return (
      <div className={styles.audioPreview}>
        <span className={styles.fileIcon}>♫</span>
        <audio src={url} controls preload="metadata" />
      </div>
    );
  }

  if (isPdf(type, url)) {
    return (
      <div className={styles.filePreview}>
        <span className={styles.fileIcon}>PDF</span>
        <span>عرض المجلة أو الملف</span>
      </div>
    );
  }

  return (
    <div className={styles.filePreview}>
      <span className={styles.fileIcon}>↗</span>
      <span>{item.mediaName || "فتح المحتوى"}</span>
    </div>
  );
}

export default function PublicCmsCollectionPage({
  section,
  titleAr,
  titleEn,
  descriptionAr,
  icon = "ب",
}: Props) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/public/cms/${section}?limit=200`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "تعذر تحميل المحتوى");
        }

        if (active) {
          setItems(data.items || []);
        }
      } catch (loadError) {
        console.error(loadError);

        if (active) {
          setError("تعذر تحميل المحتوى المنشور حاليًا.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, [section]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      [
        item.titleAr,
        item.titleEn,
        item.descriptionAr,
        item.descriptionEn,
        item.description,
        item.category,
        item.author,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [items, query]);

  return (
    <main dir="rtl" className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} />

        <div className={styles.heroContent}>
          <div className={styles.icon}>{icon}</div>

          <span className={styles.eyebrow}>{titleEn}</span>
          <h1>{titleAr}</h1>
          <p>{descriptionAr}</p>

          <div className={styles.heroActions}>
            <Link href="/" className={styles.homeButton}>
              العودة إلى الرئيسية
            </Link>

            <span className={styles.counter}>
              {items.length} محتوى منشور
            </span>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.toolbarLabel}>
              BAYAN ARABIC WORLD
            </span>
            <h2>المحتوى المنشور</h2>
          </div>

          <div className={styles.searchBox}>
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في المحتوى..."
              aria-label="البحث في المحتوى"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="مسح البحث"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeleton} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className={styles.stateCard}>
            <span>!</span>
            <h3>تعذر تحميل المحتوى</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className={styles.stateCard}>
            <span>{icon}</span>
            <h3>
              {query
                ? "لا توجد نتائج مطابقة"
                : "لا يوجد محتوى منشور بعد"}
            </h3>
            <p>
              سيظهر هنا تلقائيًا كل عنصر يتم نشره وتفعيل ظهوره من
              لوحة الإدارة.
            </p>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className={styles.grid}>
            {filteredItems.map((item, index) => {
              const href = destination(item);
              const clickable = Boolean(href);
              const content = (
                <>
                  <div className={styles.preview}>
                    <span className={styles.number}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <MediaPreview item={item} />
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.meta}>
                      <span>{item.category || titleAr}</span>
                      {(item.eventDate || item.date) && (
                        <time>{item.eventDate || item.date}</time>
                      )}
                    </div>

                    <h3>{item.titleAr || "محتوى جديد"}</h3>

                    {item.titleEn && (
                      <p className={styles.englishTitle}>
                        {item.titleEn}
                      </p>
                    )}

                    {(item.descriptionAr || item.description) && (
                      <p className={styles.description}>
                        {item.descriptionAr || item.description}
                      </p>
                    )}

                    {item.author && (
                      <p className={styles.author}>
                        إعداد: {item.author}
                      </p>
                    )}

                    <div className={styles.cardFooter}>
                      <span>
                        {clickable
                          ? isAudio(item.mediaType, item.mediaUrl)
                            ? "استمع الآن"
                            : isPdf(item.mediaType, item.mediaUrl)
                              ? "افتح الملف"
                              : "عرض المحتوى"
                          : "محتوى نصي"}
                      </span>
                      <b>←</b>
                    </div>
                  </div>
                </>
              );

              if (!clickable) {
                return (
                  <article
                    key={item.id}
                    className={styles.card}
                  >
                    {content}
                  </article>
                );
              }

              return (
                <a
                  key={item.id}
                  href={href}
                  className={styles.card}
                  target={isExternal(href) ? "_blank" : undefined}
                  rel={isExternal(href) ? "noreferrer" : undefined}
                >
                  {content}
                </a>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
