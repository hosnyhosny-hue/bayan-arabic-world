import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await bayanDb().collection("bayan_pulse_stories").orderBy("publishedAt", "desc").limit(8).get();
    const items = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: String(data.title || "قصة بيان"),
        subtitle: String(data.subtitle || (index === 0 ? "الآن" : "جديد")),
        image: String(data.imageUrl || data.coverUrl || `/images/bayan/pulse-story-${(index % 6) + 1}.jpg`),
        isLive: Boolean(data.isLive || index === 0),
      };
    });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: true, items: [] });
  }
}
