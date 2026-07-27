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
