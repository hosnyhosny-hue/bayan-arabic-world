import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const BAYAN_CONTENT_COLLECTION = "bayan_pulse_content" as const;

export const BAYAN_CONTENT_TYPES = [
  "news",
  "story",
  "event",
  "achievement",
  "hero",
  "edition",
  "article",
  "arabic-bee",
  "community",
  "resource",
  "student-work",
] as const;

export type BayanContentType =
  (typeof BAYAN_CONTENT_TYPES)[number];

export const BAYAN_CONTENT_STATUSES = [
  "draft",
  "review",
  "approved",
  "scheduled",
  "published",
  "archived",
] as const;

export type BayanContentStatus =
  (typeof BAYAN_CONTENT_STATUSES)[number];

export type BayanTimestamp =
  | Timestamp
  | FieldValue
  | Date
  | string
  | null;

export interface BayanContentRecord {
  id?: string;

  type: BayanContentType;
  channel: string;
  locale: "ar" | "en" | "bilingual";
  status: BayanContentStatus;

  titleAr: string;
  titleEn: string;

  descriptionAr: string;
  descriptionEn: string;

  bodyAr: string;
  bodyEn: string;

  mediaUrl: string;
  mediaType: string;
  mediaGallery: string[];

  category: string;
  tags: string[];

  author: string;
  authorId: string;

  featured: boolean;
  breaking: boolean;
  live: boolean;

  slug: string;

  eventDate?: BayanTimestamp;
  eventEndDate?: BayanTimestamp;
  location?: string;
  registrationUrl?: string;

  ctaLabelAr?: string;
  ctaLabelEn?: string;
  ctaUrl?: string;

  publishedAt: BayanTimestamp;
  scheduledAt: BayanTimestamp;
  createdAt: BayanTimestamp;
  updatedAt: BayanTimestamp;

  legacyCollection?: string;
  legacyId?: string;
}

type UnknownRecord = Record<string, unknown>;

function firstString(
  record: UnknownRecord,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function firstBoolean(
  record: UnknownRecord,
  keys: string[],
): boolean {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (value === "true" || value === 1) {
      return true;
    }
  }

  return false;
}

function stringArray(
  value: unknown,
): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function createSlug(
  value: string,
  fallback: string,
): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

export function normalizeStatus(
  record: UnknownRecord,
): BayanContentStatus {
  const value = firstString(record, [
    "status",
    "publicationStatus",
    "publishStatus",
  ]).toLowerCase();

  if (
    BAYAN_CONTENT_STATUSES.includes(
      value as BayanContentStatus,
    )
  ) {
    return value as BayanContentStatus;
  }

  if (
    firstBoolean(record, [
      "isPublished",
      "published",
      "active",
      "isActive",
    ])
  ) {
    return "published";
  }

  /*
   * النظام القديم لم يكن يفرض حالة نشر واضحة.
   * نستخدم published افتراضيًا حتى تستمر الأخبار الحالية
   * في الظهور بعد الانتقال إلى CMS 2.0.
   */
  return "published";
}

export function normalizeContentRecord(
  raw: UnknownRecord,
  options: {
    id: string;
    type: BayanContentType;
    legacyCollection?: string;
    includeCreatedAt?: boolean;
  },
): UnknownRecord {
  const status = normalizeStatus(raw);

  const titleAr = firstString(
    raw,
    ["titleAr", "title", "nameAr", "name"],
    "محتوى جديد",
  );

  const titleEn = firstString(raw, [
    "titleEn",
    "englishTitle",
    "nameEn",
  ]);

  const descriptionAr = firstString(raw, [
    "descriptionAr",
    "excerptAr",
    "summaryAr",
    "description",
    "excerpt",
    "summary",
  ]);

  const descriptionEn = firstString(raw, [
    "descriptionEn",
    "excerptEn",
    "summaryEn",
  ]);

  const bodyAr = firstString(
    raw,
    ["bodyAr", "contentAr", "body", "content"],
    descriptionAr,
  );

  const bodyEn = firstString(
    raw,
    ["bodyEn", "contentEn"],
    descriptionEn,
  );

  const mediaUrl = firstString(raw, [
    "mediaUrl",
    "coverUrl",
    "imageUrl",
    "thumbnailUrl",
    "image",
    "coverImage",
    "url",
  ]);

  const category = firstString(
    raw,
    ["category", "section"],
    options.type,
  );

  const channel = firstString(
    raw,
    ["channel"],
    options.type === "news"
      ? "school-news"
      : options.type === "event"
        ? "events"
        : "general",
  );

  const localeValue = firstString(
    raw,
    ["locale"],
    "bilingual",
  );

  const locale =
    localeValue === "ar" ||
    localeValue === "en" ||
    localeValue === "bilingual"
      ? localeValue
      : "bilingual";

  const now = FieldValue.serverTimestamp();

  const publishedAt =
    status === "published"
      ? raw.publishedAt || now
      : raw.publishedAt || null;

  return {
    ...raw,

    type: options.type,
    channel,
    locale,
    status,

    titleAr,
    titleEn,

    descriptionAr,
    descriptionEn,

    bodyAr,
    bodyEn,

    /*
     * aliases مؤقتة لضمان توافق واجهة Pulse الحالية
     * إلى أن تُحدّث جميع مكوناتها للنموذج الجديد.
     */
    title: titleAr,
    excerpt: descriptionAr,
    body: bodyAr,

    mediaUrl,
    coverUrl: mediaUrl,
    mediaType: firstString(raw, ["mediaType"]),
    mediaGallery: stringArray(raw.mediaGallery),

    category,
    tags: stringArray(raw.tags),

    author: firstString(
      raw,
      ["author", "authorName"],
      "قسم اللغة العربية",
    ),

    authorName: firstString(
      raw,
      ["authorName", "author"],
      "قسم اللغة العربية",
    ),

    authorId: firstString(raw, ["authorId", "createdBy"]),

    featured: firstBoolean(raw, [
      "featured",
      "isFeatured",
    ]),

    isFeatured: firstBoolean(raw, [
      "isFeatured",
      "featured",
    ]),

    breaking: firstBoolean(raw, [
      "breaking",
      "isBreaking",
      "breakingNews",
    ]),

    isBreaking: firstBoolean(raw, [
      "isBreaking",
      "breaking",
      "breakingNews",
    ]),

    live: firstBoolean(raw, ["live", "isLive"]),

    isLive: firstBoolean(raw, ["isLive", "live"]),

    slug: createSlug(
      firstString(raw, ["slug", "titleEn", "titleAr"]),
      `${options.type}-${options.id}`,
    ),

    publishedAt,
    scheduledAt: raw.scheduledAt || null,

    legacyCollection:
      options.legacyCollection ||
      firstString(raw, ["legacyCollection"]),

    legacyId:
      firstString(raw, ["legacyId"]) ||
      options.id,

    updatedAt: now,

    ...(options.includeCreatedAt
      ? {
          createdAt: raw.createdAt || now,
        }
      : {}),
  };
}
