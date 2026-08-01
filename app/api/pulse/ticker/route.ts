import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

type RecordData = Record<string, unknown> & {
  id: string;
  type?: unknown;
  order?: unknown;
  status?: unknown;
  active?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  tickerTextAr?: unknown;
  titleAr?: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isCurrentlyActive(
  item: RecordData,
  now: Date
): boolean {
  if (item.active === false) return false;
  if (text(item.status) !== "published") return false;

  const startsAt = text(item.startsAt);
  const endsAt = text(item.endsAt);

  if (startsAt) {
    const start = new Date(startsAt);

    if (
      !Number.isNaN(start.getTime()) &&
      now.getTime() < start.getTime()
    ) {
      return false;
    }
  }

  if (endsAt) {
    const end = new Date(endsAt);

    if (
      !Number.isNaN(end.getTime()) &&
      now.getTime() > end.getTime()
    ) {
      return false;
    }
  }

  return true;
}

export async function GET() {
  try {
    const now = new Date();

    const snapshot = await bayanDb()
      .collection("bayan_pulse_content")
      .limit(250)
      .get();

    const records: RecordData[] = snapshot.docs
      .map((document): RecordData => ({
        id: document.id,
        ...(document.data() as Record<string, unknown>),
      }))
      .filter(
        (item) =>
          text(item.type) === "ticker" &&
          isCurrentlyActive(item, now)
      )
      .sort(
        (a, b) =>
          numberValue(a.order) -
          numberValue(b.order)
      );

    const items = records
      .map(
        (item) =>
          text(item.tickerTextAr) ||
          text(item.titleAr)
      )
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      items,
      records: records.map((item) => ({
        id: item.id,
        text:
          text(item.tickerTextAr) ||
          text(item.titleAr),
        order: numberValue(item.order),
      })),
    });
  } catch (error) {
    console.error("[pulse/ticker][GET]", error);

    return NextResponse.json(
      {
        ok: false,
        items: [],
      },
      { status: 500 }
    );
  }
}
