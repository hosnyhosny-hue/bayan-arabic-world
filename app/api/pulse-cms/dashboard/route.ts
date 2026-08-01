import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
export const dynamic = "force-dynamic";

async function count(query: FirebaseFirestore.Query) {
  try {
    const result = await query.count().get();
    return result.data().count;
  } catch {
    return (await query.limit(1000).get()).size;
  }
}

export async function GET() {
  const root = bayanDb().collection("bayan_pulse_content");
  try {
    const [drafts, review, scheduled, published, stories, events, achievements, videos] = await Promise.all([
      count(root.where("status", "==", "draft")),
      count(root.where("status", "==", "review")),
      count(root.where("status", "==", "scheduled")),
      count(root.where("status", "==", "published")),
      count(root.where("type", "==", "story")),
      count(root.where("type", "==", "event")),
      count(root.where("type", "==", "achievement")),
      count(root.where("type", "==", "video")),
    ]);
    return NextResponse.json({ ok: true, metrics: { drafts, review, scheduled, published, stories, events, achievements, videos } });
  } catch {
    return NextResponse.json({ ok: true, metrics: { drafts:0, review:0, scheduled:0, published:0, stories:0, events:0, achievements:0, videos:0 } });
  }
}
