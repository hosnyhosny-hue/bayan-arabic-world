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
      .map((document): CmsItem => {
        const data = document.data() as Omit<CmsItem, "id">;

        return {
          id: document.id,
          ...data,
        };
      })
      .filter(
        (item: CmsItem) =>
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
        error:
          error instanceof Error
            ? error.message
            : JSON.stringify(error),
        items: [],
      },
      { status: 500 }
    );
  }
}
