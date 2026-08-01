import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bayanDb } from "@bayan/core/server";
import styles from "./pulse-detail.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ContentRecord = Record<string, unknown> & {
  id: string;
};

function stringValue(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : fallback;
}

function firstText(
  record: ContentRecord,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = stringValue(record[key]);

    if (value) {
      return value;
    }
  }

  return fallback;
}

function isPdf(url: string): boolean {
  return (
    /\.pdf(?:$|\?)/i.test(url) ||
    url.toLowerCase().includes(".pdf")
  );
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov)(?:$|\?)/i.test(
    url
  );
}

function dateLabel(
  value: unknown
): string | null {
  let date: Date | null = null;

  if (typeof value === "string") {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    }
  } else if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    date = (
      value as {
        toDate: () => Date;
      }
    ).toDate();
  }

  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("ar-QA", {
    dateStyle: "long",
  }).format(date);
}

async function getContent(
  id: string
): Promise<ContentRecord | null> {
  const decodedId = decodeURIComponent(id);

  const snapshot = await bayanDb()
    .collection("bayan_pulse_content")
    .doc(decodedId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getContent(id);

  if (!content) {
    return {
      title: "المحتوى غير موجود | BAYAN Pulse",
    };
  }

  const title = firstText(
    content,
    ["titleAr", "title", "titleEn"],
    "BAYAN Pulse"
  );

  const description = firstText(
    content,
    [
      "descriptionAr",
      "excerpt",
      "bodyAr",
      "descriptionEn",
    ],
    "محتوى من قسم اللغة العربية في كنجز كولج الدوحة."
  );

  const mediaUrl = firstText(content, [
    "coverUrl",
    "imageUrl",
    "thumbnailUrl",
    "mediaUrl",
  ]);

  return {
    title: `${title} | BAYAN Pulse`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images:
        mediaUrl && !isPdf(mediaUrl)
          ? [{ url: mediaUrl }]
          : undefined,
    },
  };
}

export default async function PulseDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const content = await getContent(id);

  if (!content) {
    notFound();
  }

  const title = firstText(
    content,
    ["titleAr", "title", "titleEn"],
    "تحديث جديد"
  );

  const description = firstText(content, [
    "descriptionAr",
    "excerpt",
    "descriptionEn",
    "caption",
  ]);

  const body = firstText(content, [
    "bodyAr",
    "body",
    "content",
    "bodyEn",
  ]);

  const type = firstText(
    content,
    ["type"],
    "article"
  );

  const category = firstText(
    content,
    ["category"],
    type
  );

  const mediaUrl = firstText(content, [
    "mediaUrl",
    "coverUrl",
    "imageUrl",
    "thumbnailUrl",
  ]);

  const pdf =
    type === "magazine" || isPdf(mediaUrl);

  const video =
    type === "video" || isVideo(mediaUrl);

  const publishedAt = dateLabel(
    content.publishedAt ||
      content.updatedAt ||
      content.createdAt
  );

  const normalizeText = (value: string) =>
    value
      .replace(/\s+/g, " ")
      .trim();

  const cleanBody =
    normalizeText(body) === normalizeText(description)
      ? ""
      : body;

  const paragraphs = cleanBody
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main
      className={styles.page}
      dir="rtl"
    >
      <header className={styles.topbar}>
        <div className={styles.container}>
          <Link
            href="/pulse"
            className={styles.brand}
          >
            <span className={styles.brandMark}>
              ب
            </span>

            <span>
              <strong>BAYAN Pulse</strong>
              <small>
                Dynamic Content Platform
              </small>
            </span>
          </Link>

          <Link
            href="/pulse#feed"
            className={styles.back}
          >
            العودة إلى النبض
          </Link>
        </div>
      </header>

      <article className={styles.article}>
        <div className={styles.heading}>
          <div className={styles.meta}>
            <span>{category}</span>

            {publishedAt ? (
              <time>{publishedAt}</time>
            ) : null}
          </div>

          <h1>{title}</h1>

          {description ? (
            <p className={styles.lead}>
              {description}
            </p>
          ) : null}
        </div>

        {pdf && mediaUrl ? (
          <section className={styles.pdfSection}>
            <div className={styles.pdfToolbar}>
              <div>
                <span>DIGITAL MAGAZINE</span>
                <strong>
                  قارئ المجلة الرقمية
                </strong>
              </div>

              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.primaryButton}
              >
                فتح بالحجم الكامل
              </a>
            </div>

            <iframe
              src={`${mediaUrl}#view=FitH`}
              title={title}
              className={styles.pdfFrame}
            />
          </section>
        ) : null}

        {video && mediaUrl ? (
          <section className={styles.media}>
            <video
              src={mediaUrl}
              controls
              playsInline
              preload="metadata"
            />
          </section>
        ) : null}

        {!pdf && !video && mediaUrl ? (
          <figure className={styles.media}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt={title} />
          </figure>
        ) : null}

        {paragraphs.length ? (
          <section className={styles.body}>
            {paragraphs.map(
              (paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 20)}`}>
                  {paragraph}
                </p>
              )
            )}
          </section>
        ) : null}

        <footer className={styles.articleFooter}>
          <div>
            <span>BAYAN CMS 2.0</span>
            <strong>
              منصة النشر الذكية لقسم اللغة العربية
            </strong>
          </div>

          <Link
            href="/pulse#feed"
            className={styles.secondaryButton}
          >
            استكشف المزيد
          </Link>
        </footer>
      </article>
    </main>
  );
}
