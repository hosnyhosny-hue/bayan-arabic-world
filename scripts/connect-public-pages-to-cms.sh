#!/usr/bin/env bash
set -euo pipefail

cd /Volumes/K/BAYAN/arabic-department-portal

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="backups/public-pages-$STAMP"

echo "▶ إنشاء النسخة الاحتياطية: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

for path in \
  app/magazine \
  app/magazines \
  app/news \
  app/events \
  app/achievements \
  app/media-gallery \
  app/resources \
  app/student-creativity \
  app/newsletters \
  app/bayan-studio
do
  if [ -d "$path" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$path")"
    cp -R "$path" "$BACKUP_DIR/$path"
  fi
done

echo "▶ إنشاء API عام موحد..."

mkdir -p 'app/api/public/cms/[section]'

cat > 'app/api/public/cms/[section]/route.ts' <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedSections = {
  news: "cms_news",
  achievements: "cms_achievements",
  events: "cms_events",
  gallery: "cms_gallery",
  magazines: "cms_magazines",
  resources: "cms_resources",
  creativity: "cms_student_creativity",
  newsletters: "cms_weekly_newsletters",
  studio: "cms_bayan_studio",
} as const;

type SectionKey = keyof typeof allowedSections;

type CmsItem = {
  id: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug?: string;
  status?: string;
  visible?: boolean;
  mediaId?: string;
  mediaName?: string;
  mediaUrl?: string;
  mediaType?: string;
  url?: string;
  category?: string;
  author?: string;
  date?: string;
  eventDate?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function timeValue(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (
    value &&
    typeof value === "object" &&
    "_seconds" in value &&
    typeof (value as { _seconds?: unknown })._seconds === "number"
  ) {
    return (value as { _seconds: number })._seconds * 1000;
  }

  if (typeof value === "string") {
    return new Date(value).getTime() || 0;
  }

  return 0;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await context.params;

    if (!(section in allowedSections)) {
      return NextResponse.json(
        { error: "Unknown CMS section." },
        { status: 404 }
      );
    }

    const sectionKey = section as SectionKey;
    const collection = allowedSections[sectionKey];

    const limitParameter = Number(
      request.nextUrl.searchParams.get("limit") || "100"
    );

    const safeLimit = Math.min(
      Math.max(Number.isFinite(limitParameter) ? limitParameter : 100, 1),
      200
    );

    const snapshot = await adminDb
      .collection(collection)
      .limit(200)
      .get();

    const items: CmsItem[] = snapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data(),
      }))
      .filter(
        (item) =>
          item.status === "published" &&
          item.visible !== false
      )
      .sort(
        (a, b) =>
          timeValue(b.updatedAt ?? b.createdAt) -
          timeValue(a.updatedAt ?? a.createdAt)
      )
      .slice(0, safeLimit);

    return NextResponse.json(
      {
        section: sectionKey,
        collection,
        count: items.length,
        items,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Public CMS collection error:", error);

    return NextResponse.json(
      {
        error: "Unable to load published content.",
        items: [],
      },
      { status: 500 }
    );
  }
}
EOF

echo "▶ إنشاء مكوّن العرض العام..."

mkdir -p src/components/site

cat > src/components/site/PublicCmsCollectionPage.tsx <<'EOF'
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
EOF

cat > src/components/site/PublicCmsCollectionPage.module.css <<'EOF'
.page {
  min-height: 100vh;
  background: #f2f7f4;
  color: #073f32;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 115px clamp(20px, 7vw, 110px) 70px;
  background:
    radial-gradient(circle at 15% 15%, rgba(246, 154, 0, 0.28), transparent 25%),
    linear-gradient(135deg, #064534 0%, #087757 100%);
  color: #fff;
}

.heroPattern {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    linear-gradient(30deg, transparent 12%, #fff 12.5%, transparent 13%),
    linear-gradient(150deg, transparent 12%, #fff 12.5%, transparent 13%);
  background-size: 70px 70px;
}

.heroContent {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: auto;
}

.icon {
  display: grid;
  place-items: center;
  width: 65px;
  height: 65px;
  margin-bottom: 22px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.13);
  font-size: 30px;
  font-weight: 900;
  backdrop-filter: blur(10px);
}

.eyebrow {
  color: #ffb032;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 2.5px;
}

.hero h1 {
  max-width: 800px;
  margin: 10px 0 12px;
  font-size: clamp(38px, 6vw, 72px);
  line-height: 1.15;
}

.hero p {
  max-width: 700px;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
  line-height: 2;
}

.heroActions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 13px;
  margin-top: 30px;
}

.homeButton,
.counter {
  display: inline-flex;
  min-height: 43px;
  align-items: center;
  justify-content: center;
  padding: 9px 18px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 900;
}

.homeButton {
  background: #f59e0b;
  color: #fff;
  text-decoration: none;
}

.counter {
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.1);
}

.content {
  width: min(1320px, calc(100% - 32px));
  margin: -25px auto 0;
  padding: clamp(22px, 4vw, 42px);
  position: relative;
  z-index: 2;
  border: 1px solid #dfe9e4;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 25px 70px rgba(5, 64, 47, 0.1);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #e2ebe7;
}

.toolbarLabel {
  display: block;
  color: #ef9200;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.8px;
}

.toolbar h2 {
  margin: 6px 0 0;
  color: #063e31;
  font-size: clamp(24px, 3vw, 34px);
}

.searchBox {
  display: flex;
  align-items: center;
  width: min(390px, 100%);
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d7e5df;
  border-radius: 14px;
  background: #f7faf9;
}

.searchBox input {
  width: 100%;
  border: 0;
  outline: none;
  padding: 10px;
  background: transparent;
  color: #064333;
  font: inherit;
}

.searchBox button {
  border: 0;
  background: transparent;
  color: #0c6c51;
  cursor: pointer;
  font-size: 20px;
}

.grid,
.loadingGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 19px;
  margin-top: 27px;
}

.card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dfeae5;
  border-radius: 20px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

a.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 44px rgba(5, 83, 60, 0.13);
}

.preview {
  position: relative;
  height: 225px;
  overflow: hidden;
  background: #e8f2ee;
}

.number {
  position: absolute;
  z-index: 3;
  top: 14px;
  left: 15px;
  color: rgba(4, 68, 51, 0.25);
  font-size: 17px;
  font-weight: 900;
}

.coverImage,
.video {
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
    radial-gradient(circle at 20% 15%, rgba(245, 158, 11, 0.3), transparent 28%),
    linear-gradient(135deg, #064332, #07936a);
  color: white;
  text-align: center;
}

.placeholder span {
  font-size: 57px;
  font-weight: 900;
}

.placeholder small {
  font-size: 9px;
  letter-spacing: 3px;
}

.filePreview,
.audioPreview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  height: 100%;
  padding: 25px;
  background:
    radial-gradient(circle at top left, rgba(245, 158, 11, 0.25), transparent 35%),
    linear-gradient(135deg, #07513e, #07976c);
  color: white;
  text-align: center;
}

.audioPreview audio {
  width: min(280px, 92%);
}

.fileIcon {
  display: grid;
  place-items: center;
  min-width: 68px;
  min-height: 68px;
  padding: 9px;
  border: 1px solid rgba(255, 255, 255, 0.33);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.13);
  font-size: 18px;
  font-weight: 900;
}

.cardBody {
  padding: 20px;
}

.meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #079269;
  font-size: 9px;
  font-weight: 900;
}

.cardBody h3 {
  margin: 11px 0 5px;
  overflow-wrap: anywhere;
  color: #073f32;
  font-size: 20px;
  line-height: 1.55;
}

.englishTitle {
  margin: 0 0 12px;
  color: #81918b;
  font-size: 11px;
}

.description {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #687d75;
  font-size: 12px;
  line-height: 1.9;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.author {
  margin: 11px 0 0;
  color: #81918b;
  font-size: 10px;
}

.cardFooter {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 13px;
  border-top: 1px solid #edf2f0;
  color: #eb8c00;
  font-size: 10px;
  font-weight: 900;
}

.stateCard {
  display: grid;
  place-items: center;
  min-height: 310px;
  margin-top: 28px;
  padding: 35px;
  border: 1px dashed #c9ded5;
  border-radius: 21px;
  background: #f7faf9;
  text-align: center;
}

.stateCard > span {
  display: grid;
  place-items: center;
  width: 65px;
  height: 65px;
  border-radius: 19px;
  background: #e3f4ed;
  color: #07805e;
  font-size: 27px;
  font-weight: 900;
}

.stateCard h3 {
  margin: 15px 0 4px;
  font-size: 21px;
}

.stateCard p {
  max-width: 520px;
  color: #71857d;
  font-size: 12px;
  line-height: 1.8;
}

.skeleton {
  height: 390px;
  border-radius: 20px;
  background: linear-gradient(90deg, #edf3f0 25%, #e2ebe7 50%, #edf3f0 75%);
  background-size: 200% 100%;
  animation: loading 1.2s infinite;
}

@keyframes loading {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 980px) {
  .grid,
  .loadingGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .hero {
    padding: 105px 20px 55px;
  }

  .content {
    width: calc(100% - 20px);
    padding: 18px;
    border-radius: 21px;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .searchBox {
    width: 100%;
  }

  .grid,
  .loadingGrid {
    grid-template-columns: 1fr;
  }

  .preview {
    height: 230px;
  }
}
EOF

echo "▶ إنشاء صفحات الموقع الديناميكية..."

create_page() {
  local route="$1"
  local section="$2"
  local title_ar="$3"
  local title_en="$4"
  local description="$5"
  local icon="$6"

  mkdir -p "app/$route"

  cat > "app/$route/page.tsx" <<EOF
import PublicCmsCollectionPage from "@/src/components/site/PublicCmsCollectionPage";

export default function Page() {
  return (
    <PublicCmsCollectionPage
      section="$section"
      titleAr="$title_ar"
      titleEn="$title_en"
      descriptionAr="$description"
      icon="$icon"
    />
  );
}
EOF
}

create_page \
  "magazine" \
  "magazines" \
  "المجلة الرقمية" \
  "Digital Magazine" \
  "إصدارات قسم اللغة العربية، ومجلات الطلاب، والقصص والمقالات والمحتوى الإبداعي." \
  "م"

create_page \
  "magazines" \
  "magazines" \
  "المجلة الرقمية" \
  "Digital Magazine" \
  "إصدارات قسم اللغة العربية، ومجلات الطلاب، والقصص والمقالات والمحتوى الإبداعي." \
  "م"

create_page \
  "news" \
  "news" \
  "الأخبار والإعلانات" \
  "News & Announcements" \
  "آخر أخبار قسم اللغة العربية والإعلانات والتحديثات المهمة." \
  "خ"

create_page \
  "events" \
  "events" \
  "الفعاليات" \
  "Events" \
  "الفعاليات التعليمية والثقافية والمسابقات والمناسبات المدرسية." \
  "ف"

create_page \
  "achievements" \
  "achievements" \
  "الإنجازات" \
  "Achievements" \
  "إنجازات طلابنا ومعلمينا والنجاحات المتميزة في اللغة العربية." \
  "إ"

create_page \
  "media-gallery" \
  "gallery" \
  "المعرض الإعلامي" \
  "Media Gallery" \
  "صور وفيديوهات توثّق أنشطة القسم وتجارب الطلاب وإنجازاتهم." \
  "ص"

create_page \
  "resources" \
  "resources" \
  "مكتبة الموارد" \
  "Resources Hub" \
  "ملفات تعليمية وكتب وأوراق عمل ومصادر داعمة للتعلم." \
  "ر"

create_page \
  "student-creativity" \
  "creativity" \
  "إبداعات الطلاب" \
  "Student Creativity" \
  "مساحة لعرض الكتابات والقصص والأعمال الفنية والإنتاج الإبداعي للطلاب." \
  "ط"

create_page \
  "newsletters" \
  "newsletters" \
  "النشرة الأسبوعية" \
  "Weekly Newsletter" \
  "ملخص أسبوعي لأبرز ما جرى في القسم وما ينتظر الطلاب في الأسبوع القادم." \
  "ن"

create_page \
  "bayan-studio" \
  "studio" \
  "استوديو بيان" \
  "Bayan Studio" \
  "المحتوى المرئي والصوتي والبودكاست والمشروعات الرقمية لقسم اللغة العربية." \
  "ب"

echo "▶ فحص TypeScript والبناء..."

rm -rf .next
npm run build

echo
echo "✅ تم ربط صفحات الموقع العامة بلوحة إدارة المحتوى."
echo "📦 النسخة الاحتياطية: $BACKUP_DIR"
echo
echo "شغّل الموقع بالأمر:"
echo "npm run dev"
