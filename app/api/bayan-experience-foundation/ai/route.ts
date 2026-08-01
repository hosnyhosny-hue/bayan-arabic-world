import { NextResponse } from "next/server";
import type { ExperienceScene, SceneType } from "@/packages/bayan-experience-foundation/src";

function frames(y: number, h: number) {
  return {
    desktop: { x: 40, y, w: 920, h },
    tablet: { x: 24, y, w: 712, h: Math.round(h * .86) },
    mobile: { x: 14, y, w: 362, h: Math.max(170, Math.round(h * .68)) },
  };
}

export async function POST(request: Request) {
  const { prompt = "" } = await request.json() as { prompt?: string };
  const value = prompt.toLowerCase();
  const types: SceneType[] = ["hero"];
  if (/خبر|أخبار|news|نبض/.test(value)) types.push("feed");
  if (/فعالية|فعاليات|event/.test(value)) types.push("events");
  if (/إنجاز|achievement|تفوق/.test(value)) types.push("achievements");
  if (/صور|معرض|gallery/.test(value)) types.push("gallery");
  if (/قصة|قصص|stories/.test(value)) types.push("stories");
  if (/arabic bee|نحلة|مسابقة/.test(value)) types.push("arabicBee");
  if (types.length === 1) types.push("channels", "feed", "events");

  const labels: Record<SceneType, string> = {
    hero: "مرحبًا بكم في BAYAN Family",
    channels: "قنوات بيان",
    stories: "قصص اليوم",
    feed: "أخبار المدرسة",
    events: "الفعاليات القادمة",
    achievements: "لوحة الشرف",
    gallery: "لحظات بيان",
    arabicBee: "Arabic Bee",
    cta: "ابدأ الآن",
    custom: "قسم مخصص",
  };
  const collections: Partial<Record<SceneType, string>> = {
    hero: "bayan_pulse_content",
    channels: "bayan_channels",
    stories: "bayan_pulse_stories",
    feed: "bayan_social_posts",
    events: "bayan_events",
    achievements: "bayan_achievements",
    gallery: "bayan_media",
  };

  let y = 30;
  const scenes: ExperienceScene[] = types.map((type) => {
    const h = type === "hero" ? 340 : type === "feed" ? 500 : 220;
    const scene: ExperienceScene = {
      id: `${type}-${crypto.randomUUID()}`,
      type,
      name: labels[type],
      enabled: true,
      audience: "all",
      motion: type === "hero" ? "fade" : "slide-up",
      data: collections[type] ? { collection: collections[type], limit: type === "feed" ? 12 : 6, orderDirection: "desc" } : undefined,
      bindings: {
        title: { mode: "static", value: labels[type] },
        subtitle: { mode: "static", value: "" },
      },
      style: { variant: type === "hero" ? "gradient" : "editorial", align: "start" },
      frames: frames(y, h),
    };
    y += h + 28;
    return scene;
  });

  return NextResponse.json({ ok: true, scenes });
}
