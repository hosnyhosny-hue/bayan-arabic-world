#!/usr/bin/env bash
set -euo pipefail

cd /Volumes/K/BAYAN/arabic-department-portal

echo "▶ 1/6 أخذ نسخة احتياطية من الصفحة الرئيسية..."

if [ ! -f app/page.tsx ]; then
  echo "❌ لم يتم العثور على app/page.tsx"
  exit 1
fi

cp app/page.tsx backups/app-page-before-cms.tsx
cp app/page.tsx app/legacy-home-component.tsx

echo "▶ 2/6 إنشاء API عام لقراءة المحتوى المنشور..."

cat > app/api/public/cms/home/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CmsDocument = {
  id: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug?: string;
  status?: string;
  visible?: boolean;
  mediaUrl?: string;
  mediaName?: string;
  mediaType?: string;
  url?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const sections = [
  {
    key: "news",
    titleAr: "الأخبار والإعلانات",
    titleEn: "News & Announcements",
    collection: "cms_news",
    href: "/news",
  },
  {
    key: "achievements",
    titleAr: "الإنجازات",
    titleEn: "Achievements",
    collection: "cms_achievements",
    href: "/achievements",
  },
  {
    key: "events",
    titleAr: "الفعاليات",
    titleEn: "Events",
    collection: "cms_events",
    href: "/events",
  },
  {
    key: "gallery",
    titleAr: "المعرض الإعلامي",
    titleEn: "Media Gallery",
    collection: "cms_gallery",
    href: "/media-gallery",
  },
  {
    key: "magazines",
    titleAr: "المجلة الرقمية",
    titleEn: "Digital Magazine",
    collection: "cms_magazines",
    href: "/magazines",
  },
  {
    key: "resources",
    titleAr: "مكتبة الموارد",
    titleEn: "Resources Hub",
    collection: "cms_resources",
    href: "/resources",
  },
  {
    key: "creativity",
    titleAr: "إبداعات الطلاب",
    titleEn: "Student Creativity",
    collection: "cms_student_creativity",
    href: "/student-creativity",
  },
  {
    key: "newsletters",
    titleAr: "النشرة الأسبوعية",
    titleEn: "Weekly Newsletter",
    collection: "cms_weekly_newsletters",
    href: "/newsletters",
  },
  {
    key: "studio",
    titleAr: "استوديو بيان",
    titleEn: "Bayan Studio",
    collection: "cms_bayan_studio",
    href: "/bayan-studio",
  },
] as const;

function timestampValue(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (typeof value === "string") {
    return new Date(value).getTime() || 0;
  }

  return 0;
}

export async function GET() {
  try {
    const result = await Promise.all(
      sections.map(async (section) => {
        const snapshot = await adminDb
          .collection(section.collection)
          .limit(100)
          .get();

        const items = snapshot.docs
          .map(
            (document): CmsDocument => ({
              id: document.id,
              ...document.data(),
            })
          )
          .filter(
            (item) =>
              item.status === "published" &&
              item.visible !== false
          )
          .sort(
            (a, b) =>
              timestampValue(b.updatedAt ?? b.createdAt) -
              timestampValue(a.updatedAt ?? a.createdAt)
          )
          .slice(0, 6);

        return {
          key: section.key,
          titleAr: section.titleAr,
          titleEn: section.titleEn,
          href: section.href,
          items,
        };
      })
    );

    return NextResponse.json(
      {
        sections: result,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Public CMS homepage error:", error);

    return NextResponse.json(
      {
        sections: [],
        error: "Unable to load homepage content.",
      },
      { status: 500 }
    );
  }
}
EOF

echo "▶ 3/6 إنشاء مكوّن الأقسام الديناميكية..."

cat > src/components/site/CmsHomeSections.tsx <<'EOF'
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
EOF

echo "▶ 4/6 إنشاء التصميم..."

cat > src/components/site/CmsHomeSections.module.css <<'EOF'
.cmsArea {
  --green-950: #063d31;
  --green-900: #07513f;
  --green-700: #087756;
  --green-600: #059669;
  --orange: #f59e0b;
  --background: #f3f7f5;
  --border: #dce8e3;
  width: 100%;
  padding: 76px clamp(18px, 5vw, 72px) 90px;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(245, 158, 11, 0.1),
      transparent 23%
    ),
    var(--background);
  color: #153e32;
}

.intro {
  width: min(1320px, 100%);
  margin: 0 auto 38px;
  text-align: center;
}

.intro > span {
  display: inline-block;
  color: var(--orange);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
}

.intro h2 {
  margin: 9px 0 10px;
  color: var(--green-950);
  font-size: clamp(29px, 4vw, 46px);
  line-height: 1.25;
}

.intro p {
  max-width: 720px;
  margin: 0 auto;
  color: #6d8179;
  font-size: 14px;
  line-height: 1.9;
}

.sections {
  display: grid;
  gap: 34px;
  width: min(1320px, 100%);
  margin: 0 auto;
}

.section {
  padding: clamp(18px, 3vw, 30px);
  border: 1px solid rgba(220, 232, 227, 0.9);
  border-radius: 25px;
  background: #ffffff;
  box-shadow: 0 18px 50px rgba(6, 73, 54, 0.07);
}

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 21px;
}

.sectionHeader span {
  display: block;
  margin-bottom: 4px;
  color: var(--orange);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
}

.sectionHeader h3 {
  margin: 0;
  color: var(--green-950);
  font-size: clamp(21px, 3vw, 29px);
}

.sectionHeader > a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 8px 15px;
  border-radius: 11px;
  background: #eaf7f2;
  color: var(--green-700);
  font-size: 11px;
  font-weight: 900;
  text-decoration: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.card:hover {
  border-color: #76c9aa;
  transform: translateY(-4px);
  box-shadow: 0 18px 35px rgba(5, 105, 77, 0.12);
}

.preview {
  height: 190px;
  overflow: hidden;
  background: #eaf4f0;
}

.preview img,
.preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  display: grid;
  place-content: center;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(
      circle at top left,
      rgba(245, 158, 11, 0.2),
      transparent 30%
    ),
    linear-gradient(135deg, var(--green-950), var(--green-600));
  color: #ffffff;
  text-align: center;
}

.placeholder span {
  font-size: 47px;
  font-weight: 900;
}

.placeholder small {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 9px;
  letter-spacing: 1px;
}

.cardBody {
  padding: 17px;
}

.cardBody > small {
  color: var(--green-600);
  font-size: 9px;
  font-weight: 900;
}

.cardBody h4 {
  margin: 8px 0 6px;
  overflow-wrap: anywhere;
  color: var(--green-950);
  font-size: 17px;
  line-height: 1.55;
}

.englishTitle {
  margin: 0 0 9px;
  color: #7a8d86;
  font-size: 10px;
}

.description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #6c8078;
  font-size: 11px;
  line-height: 1.8;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.openLabel {
  display: inline-block;
  margin-top: 13px;
  color: var(--green-600);
  font-size: 10px;
  font-weight: 900;
}

.loadingSection {
  padding: 50px;
  background: #f3f7f5;
}

.loadingBar {
  width: min(700px, 80%);
  height: 8px;
  margin: auto;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    #e1eee9 25%,
    #cce4db 50%,
    #e1eee9 75%
  );
  background-size: 200% 100%;
  animation: loading 1.3s infinite;
}

@keyframes loading {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .cmsArea {
    padding: 54px 14px 65px;
  }

  .section {
    padding: 16px;
    border-radius: 19px;
  }

  .sectionHeader {
    align-items: flex-start;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .preview {
    height: 205px;
  }
}
EOF

echo "▶ 5/6 ربط المكوّن بالصفحة الرئيسية الحالية..."

cat > app/page.tsx <<'EOF'
import LegacyHomePage from "./legacy-home-component";
import CmsHomeSections from "@/src/components/site/CmsHomeSections";

export default function HomePage() {
  return (
    <>
      <LegacyHomePage />
      <CmsHomeSections />
    </>
  );
}
EOF

echo "▶ 6/6 فحص البناء..."

rm -rf .next
npm run build

echo
echo "✅ تم ربط الصفحة الرئيسية بلوحة الإدارة بنجاح."
echo "افتح: http://localhost:3000/"
