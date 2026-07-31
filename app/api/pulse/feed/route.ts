import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

type PulseRecord = Record<string, unknown> & {
  id: string;
};

function serialize(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;

  if (
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      serialize(item),
    ])
  );
}

function dateValue(value: unknown): number {
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
}

function firstText(
  record: PulseRecord,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function localeMatches(
  recordLocale: string,
  requestedLocale: string
): boolean {
  if (!requestedLocale || requestedLocale === "all") {
    return true;
  }

  if (!recordLocale || recordLocale === "bilingual") {
    return true;
  }

  return recordLocale === requestedLocale;
}

function mapItem(data: PulseRecord, locale: string) {
  const prefersEnglish = locale === "en";

  const title = prefersEnglish
    ? firstText(
        data,
        ["titleEn", "title", "titleAr"],
        "New update"
      )
    : firstText(
        data,
        ["titleAr", "title", "titleEn"],
        "تحديث جديد"
      );

  const excerpt = prefersEnglish
    ? firstText(data, [
        "descriptionEn",
        "excerptEn",
        "bodyEn",
        "excerpt",
        "descriptionAr",
        "bodyAr",
        "body",
        "content",
        "caption",
      ])
    : firstText(data, [
        "descriptionAr",
        "excerptAr",
        "bodyAr",
        "excerpt",
        "descriptionEn",
        "bodyEn",
        "body",
        "content",
        "caption",
      ]);

  return {
    id: data.id,
    title,
    excerpt,
    image: firstText(
      data,
      [
        "mediaUrl",
        "coverUrl",
        "imageUrl",
        "thumbnailUrl",
      ],
      "/images/bayan/pulse-feed-1.jpg"
    ),
    category: firstText(
      data,
      ["category", "type"],
      "نبض بيان"
    ),
    channel: firstText(
      data,
      ["channel"],
      "school-news"
    ),
    type: firstText(data, ["type"], "news"),
    locale: firstText(data, ["locale"], "bilingual"),
    publishedAt:
      data.publishedAt ||
      data.updatedAt ||
      data.createdAt ||
      null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const cursor = searchParams.get("cursor");
  const channel = searchParams.get("channel") || "all";
  const locale = searchParams.get("locale") || "ar";

  const pageSize = Math.max(
    1,
    Math.min(Number(searchParams.get("limit") || 6), 12)
  );

  try {
    /*
     * نجلب مجموعة محدودة ثم نطبّق التصفية والترتيب في الخادم
     * لتجنب الحاجة إلى Firestore Composite Index.
     */
    const snapshot = await bayanDb()
      .collection("bayan_pulse_content")
      .limit(200)
      .get();

    const records: PulseRecord[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(serialize(doc.data()) as Record<string, unknown>),
    }));

    const filtered = records
      .filter((record) => {
        const recordType = String(record.type || "")
          .trim()
          .toLowerCase();

        /*
         * Hero وشريط الأخبار من عناصر واجهة BAYAN Pulse،
         * ولهما مكونات مستقلة، لذلك لا يظهران مرة أخرى
         * داخل قسم Continuous Pulse.
         */
        if (recordType === "hero" || recordType === "ticker") {
          return false;
        }

        const recordStatus = String(
          record.status ||
          (record.isPublished ? "published" : "")
        ).toLowerCase();

        const recordLocale = String(
          record.locale || "bilingual"
        ).toLowerCase();

        const recordChannel = String(
          record.channel || "school-news"
        );

        /*
         * توافق مؤقت مع محتوى Pulse القديم:
         * السجل الذي لا يحمل status لكنه منشور فعليًا
         * لا يُستبعد أثناء الانتقال إلى CMS 2.0.
         */
        const isPublished =
          recordStatus === "published" ||
          record.isPublished === true ||
          record.published === true;

        if (!isPublished) return false;

        if (!localeMatches(recordLocale, locale)) {
          return false;
        }

        if (
          channel !== "all" &&
          recordChannel !== channel
        ) {
          return false;
        }

        return true;
      })
      .sort((first, second) => {
        const firstDate = dateValue(
          first.publishedAt ||
          first.updatedAt ||
          first.createdAt
        );

        const secondDate = dateValue(
          second.publishedAt ||
          second.updatedAt ||
          second.createdAt
        );

        return secondDate - firstDate;
      });

    let startIndex = 0;

    if (cursor && cursor !== "initial") {
      const cursorIndex = filtered.findIndex(
        (record) => record.id === cursor
      );

      if (cursorIndex >= 0) {
        startIndex = cursorIndex + 1;
      }
    }

    const page = filtered.slice(
      startIndex,
      startIndex + pageSize
    );

    const hasMore =
      startIndex + pageSize < filtered.length;

    return NextResponse.json({
      ok: true,
      items: page.map((item) =>
        mapItem(item, locale)
      ),
      nextCursor:
        hasMore && page.length
          ? page[page.length - 1].id
          : null,
      meta: {
        totalFetched: records.length,
        totalMatched: filtered.length,
        channel,
        locale,
      },
    });
  } catch (error) {
    console.error("[BAYAN Pulse Feed]", error);

    return NextResponse.json({
      ok: true,
      items: [],
      nextCursor: null,
      degraded: true,
    });
  }
}
