"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./CmsHomeSections.module.css";

type CmsItem = {
  id: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug?: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaType?: string;
  url?: string;
};

type CmsSection = {
  key: string;
  titleAr: string;
  titleEn: string;
  href: string;
  items: CmsItem[];
};

function itemLink(section: CmsSection, item: CmsItem) {
  if (item.mediaUrl && !item.slug) {
    return item.mediaUrl;
  }

  if (item.url) {
    return item.url;
  }

  if (item.slug) {
    return `${section.href}/${item.slug}`;
  }

  return section.href;
}

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href);
}

function isImage(type = "") {
  return type.startsWith("image/");
}

function isVideo(type = "") {
  return type.startsWith("video/");
}

export default function CmsHomeSections() {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/public/cms/home", {
          cache: "no-store",
        });

        const result = await response.json();

        if (active && response.ok) {
          setSections(result.sections ?? []);
        }
      } catch (error) {
        console.error("Unable to load CMS homepage:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const visibleSections = useMemo(
    () => sections.filter((section) => section.items.length > 0),
    [sections]
  );

  if (loading) {
    return (
      <section
        dir="rtl"
        className={styles.loadingSection}
        aria-label="جارٍ تحميل المحتوى"
      >
        <div className={styles.loadingBar} />
      </section>
    );
  }

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <section dir="rtl" className={styles.cmsArea}>
      <div className={styles.intro}>
        <span>BAYAN ARABIC WORLD</span>
        <h2>أحدث محتوى عالم بيان</h2>
        <p>
          الأخبار والفعاليات والإبداعات والمصادر التي نُشرت من
          خلال لوحة إدارة المحتوى.
        </p>
      </div>

      <div className={styles.sections}>
        {visibleSections.map((section) => (
          <section key={section.key} className={styles.section}>
            <header className={styles.sectionHeader}>
              <div>
                <span>{section.titleEn}</span>
                <h3>{section.titleAr}</h3>
              </div>

              <Link href={section.href}>عرض الكل</Link>
            </header>

            <div className={styles.grid}>
              {section.items.map((item) => {
                const href = itemLink(section, item);
                const external = isExternalLink(href);

                const content = (
                  <>
                    <div className={styles.preview}>
                      {item.mediaUrl &&
                      isImage(item.mediaType) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.mediaUrl}
                          alt={item.titleAr || item.mediaName || ""}
                        />
                      ) : item.mediaUrl &&
                        isVideo(item.mediaType) ? (
                        <video
                          src={item.mediaUrl}
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <div className={styles.placeholder}>
                          <span>ب</span>
                          <small>{section.titleEn}</small>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <small>{section.titleAr}</small>
                      <h4>{item.titleAr || "محتوى جديد"}</h4>

                      {item.titleEn && (
                        <p className={styles.englishTitle}>
                          {item.titleEn}
                        </p>
                      )}

                      {item.descriptionAr && (
                        <p className={styles.description}>
                          {item.descriptionAr}
                        </p>
                      )}

                      <span className={styles.openLabel}>
                        فتح المحتوى
                      </span>
                    </div>
                  </>
                );

                return external ? (
                  <a
                    key={item.id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.card}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    href={href}
                    className={styles.card}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
