import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

const seed = {
  bayan_channels: [
    { id: "arabic-bee", title: "Arabic Bee", subtitle: "تحديات اللغة", icon: "ض", filter: "arabic-bee", order: 1, active: true },
    { id: "achievements", title: "الإنجازات", subtitle: "نجوم بيان", icon: "★", filter: "achievement", order: 2, active: true },
    { id: "events", title: "الفعاليات", subtitle: "هذا الأسبوع", icon: "◉", filter: "event", order: 3, active: true },
    { id: "trips", title: "الرحلات", subtitle: "لحظات مميزة", icon: "✦", filter: "trip", order: 4, active: true },
    { id: "reading", title: "القراءة", subtitle: "قصص جديدة", icon: "📚", filter: "reading", order: 5, active: true }
  ],
  bayan_quick_links: [
    { id: "news", title: "الأخبار", href: "/news", icon: "◫", order: 1, active: true },
    { id: "events", title: "الفعاليات", href: "/events", icon: "▦", order: 2, active: true },
    { id: "achievements", title: "الإنجازات", href: "/achievements", icon: "★", order: 3, active: true },
    { id: "resources", title: "المصادر", href: "/resources", icon: "▤", order: 4, active: true }
  ],
  bayan_pulse_stories: [
    { id: "story-arabic-bee", title: "Arabic Bee", subtitle: "تحدي اليوم", icon: "ض", category: "arabic-bee", publishedAt: new Date(), active: true },
    { id: "story-achievements", title: "الإنجازات", subtitle: "نجوم الأسبوع", icon: "★", category: "achievement", publishedAt: new Date(), active: true },
    { id: "story-events", title: "الفعاليات", subtitle: "قريبًا", icon: "◉", category: "event", publishedAt: new Date(), active: true }
  ]
};

export async function POST() {
  try {
    const batch = bayanDb().batch();

    for (const [collection, items] of Object.entries(seed)) {
      for (const item of items) {
        const ref = bayanDb().collection(collection).doc(item.id);
        batch.set(ref, item, { merge: true });
      }
    }

    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Experience seed]", error);
    return NextResponse.json({ ok: false, error: "Seed failed" }, { status: 500 });
  }
}
