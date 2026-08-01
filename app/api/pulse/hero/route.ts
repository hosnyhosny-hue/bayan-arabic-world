import { NextRequest, NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

type RecordData = Record<string, unknown> & {
  id: string;
  type?: unknown;
  slot?: unknown;
  order?: unknown;
  status?: unknown;
  active?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  greetingAr?: unknown;
  titleAr?: unknown;
  descriptionAr?: unknown;
  mediaUrl?: unknown;
  label?: unknown;
  primaryButtonTextAr?: unknown;
  primaryButtonUrl?: unknown;
  secondaryButtonTextAr?: unknown;
  secondaryButtonUrl?: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function currentSlot(hour: number): string {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "day";
  if (hour >= 16 && hour < 20) return "evening";
  return "night";
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

export async function GET(request: NextRequest) {
  try {
    const requestedHour = Number(
      request.nextUrl.searchParams.get("hour")
    );

    const hour = Number.isFinite(requestedHour)
      ? Math.min(23, Math.max(0, requestedHour))
      : new Date().getHours();

    const slot = currentSlot(hour);
    const now = new Date();

    const snapshot = await bayanDb()
      .collection("bayan_pulse_content")
      .limit(250)
      .get();

    const heroes: RecordData[] = snapshot.docs
      .map((document): RecordData => ({
        id: document.id,
        ...(document.data() as Record<string, unknown>),
      }))
      .filter(
        (item) =>
          text(item.type) === "hero" &&
          isCurrentlyActive(item, now)
      )
      .filter((item) => {
        const itemSlot = text(item.slot) || "all";
        return itemSlot === slot || itemSlot === "all";
      })
      .sort((a, b) => {
        const slotPriorityA =
          text(a.slot) === slot ? 0 : 1;

        const slotPriorityB =
          text(b.slot) === slot ? 0 : 1;

        if (slotPriorityA !== slotPriorityB) {
          return slotPriorityA - slotPriorityB;
        }

        return numberValue(a.order) - numberValue(b.order);
      });

    const hero = heroes[0];

    if (!hero) {
      return NextResponse.json({
        ok: true,
        item: null,
        slot,
      });
    }

    return NextResponse.json({
      ok: true,
      slot,
      item: {
        id: hero.id,
        slot: text(hero.slot) || slot,
        greeting:
          text(hero.greetingAr) || "نبض بيان",
        title: text(hero.titleAr),
        copy: text(hero.descriptionAr),
        image: text(hero.mediaUrl),
        label:
          text(hero.label) || "BAYAN EDITION",
        primaryButtonText:
          text(hero.primaryButtonTextAr) ||
          "اقرأ إصدار اليوم",
        primaryButtonUrl:
          text(hero.primaryButtonUrl) ||
          "/pulse#today",
        secondaryButtonText:
          text(hero.secondaryButtonTextAr) ||
          "دخول العائلة",
        secondaryButtonUrl:
          text(hero.secondaryButtonUrl) ||
          "/login",
      },
    });
  } catch (error) {
    console.error("[pulse/hero][GET]", error);

    return NextResponse.json(
      {
        ok: false,
        item: null,
      },
      { status: 500 }
    );
  }
}
