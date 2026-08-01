import { NextRequest, NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

const COLLECTION = "bayan_pulse_content";
const ALLOWED_TYPES = new Set(["hero", "ticker"]);
const ALLOWED_SLOTS = new Set([
  "morning",
  "day",
  "evening",
  "night",
  "all",
]);

type EditorialPayload = {
  id?: string;
  type?: string;
  slot?: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  greetingAr?: string;
  label?: string;
  mediaUrl?: string;
  primaryButtonTextAr?: string;
  primaryButtonUrl?: string;
  secondaryButtonTextAr?: string;
  secondaryButtonUrl?: string;
  tickerTextAr?: string;
  tickerTextEn?: string;
  order?: number;
  active?: boolean;
  status?: string;
  startsAt?: string;
  endsAt?: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function booleanValue(value: unknown, fallback = true): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function serializeDate(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return null;
}

type EditorialRecord = Record<string, unknown> & {
  id: string;
  type?: string;
  order?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
};

function serializeDocument(
  document: FirebaseFirestore.QueryDocumentSnapshot
): EditorialRecord {
  const data = document.data() as Record<string, unknown>;

  return {
    id: document.id,
    ...data,
    createdAt: serializeDate(data.createdAt) ?? data.createdAt ?? null,
    updatedAt: serializeDate(data.updatedAt) ?? data.updatedAt ?? null,
    publishedAt:
      serializeDate(data.publishedAt) ?? data.publishedAt ?? null,
  };
}

export async function GET() {
  try {
    const snapshot = await bayanDb()
      .collection(COLLECTION)
      .limit(250)
      .get();

    const items = snapshot.docs
      .map(serializeDocument)
      .filter((item) => ALLOWED_TYPES.has(String(item.type)))
      .sort((a, b) => {
        if (a.type !== b.type) {
          return String(a.type).localeCompare(String(b.type));
        }

        return numberValue(a.order) - numberValue(b.order);
      });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error("[admin/cms/editorial][GET]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "تعذر تحميل محتوى الاستوديو التحريري.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EditorialPayload;
    const type = text(body.type);

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "نوع المحتوى غير مدعوم.",
        },
        { status: 400 }
      );
    }

    const slot = ALLOWED_SLOTS.has(text(body.slot))
      ? text(body.slot)
      : "all";

    const id = text(body.id);
    const reference = id
      ? bayanDb().collection(COLLECTION).doc(id)
      : bayanDb().collection(COLLECTION).doc();

    const now = new Date().toISOString();

    const common = {
      type,
      channel: type === "hero" ? "homepage" : "ticker",
      locale: "bilingual",
      status: text(body.status) || "draft",
      active: booleanValue(body.active),
      order: numberValue(body.order),
      startsAt: text(body.startsAt) || null,
      endsAt: text(body.endsAt) || null,
      updatedAt: now,
    };

    const payload =
      type === "hero"
        ? {
            ...common,
            slot,
            titleAr: text(body.titleAr),
            titleEn: text(body.titleEn),
            descriptionAr: text(body.descriptionAr),
            descriptionEn: text(body.descriptionEn),
            greetingAr: text(body.greetingAr),
            label: text(body.label),
            mediaUrl: text(body.mediaUrl),
            primaryButtonTextAr:
              text(body.primaryButtonTextAr) || "اقرأ إصدار اليوم",
            primaryButtonUrl:
              text(body.primaryButtonUrl) || "/pulse#today",
            secondaryButtonTextAr:
              text(body.secondaryButtonTextAr) || "دخول العائلة",
            secondaryButtonUrl:
              text(body.secondaryButtonUrl) || "/login",
          }
        : {
            ...common,
            tickerTextAr:
              text(body.tickerTextAr) || text(body.titleAr),
            tickerTextEn:
              text(body.tickerTextEn) || text(body.titleEn),
            titleAr:
              text(body.titleAr) || text(body.tickerTextAr),
            titleEn:
              text(body.titleEn) || text(body.tickerTextEn),
          };

    if (
      type === "hero" &&
      !text((payload as { titleAr?: string }).titleAr)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "أدخل عنوان الخبر الرئيسي.",
        },
        { status: 400 }
      );
    }

    if (
      type === "ticker" &&
      !text((payload as { tickerTextAr?: string }).tickerTextAr)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "أدخل نص شريط الأخبار.",
        },
        { status: 400 }
      );
    }

    const existing = await reference.get();

    await reference.set(
      {
        ...payload,
        createdAt: existing.exists
          ? existing.data()?.createdAt ?? now
          : now,
        publishedAt:
          payload.status === "published"
            ? existing.data()?.publishedAt ?? now
            : existing.data()?.publishedAt ?? null,
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      id: reference.id,
    });
  } catch (error) {
    console.error("[admin/cms/editorial][POST]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "تعذر حفظ المحتوى.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = text(request.nextUrl.searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "معرف المحتوى مطلوب.",
        },
        { status: 400 }
      );
    }

    await bayanDb()
      .collection(COLLECTION)
      .doc(id)
      .delete();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("[admin/cms/editorial][DELETE]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "تعذر حذف المحتوى.",
      },
      { status: 500 }
    );
  }
}
