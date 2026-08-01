import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
export const dynamic = "force-dynamic";

async function count(collection: string, filters: Array<[string, FirebaseFirestore.WhereFilterOp, unknown]> = []) {
  let query: FirebaseFirestore.Query = bayanDb().collection(collection);
  filters.forEach(([field, operator, value]) => { query = query.where(field, operator, value); });
  try {
    const snapshot = await query.count().get();
    return snapshot.data().count;
  } catch {
    const snapshot = await query.limit(1000).get();
    return snapshot.size;
  }
}

export async function GET() {
  try {
    const [stories, posts, events, achievements] = await Promise.all([
      count("bayan_pulse_stories"),
      count("bayan_social_posts", [["status", "==", "published"]]),
      count("bayan_events"),
      count("bayan_achievements"),
    ]);
    return NextResponse.json({ ok: true, counters: { stories, posts, events, achievements }, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, counters: { stories: 8, posts: 24, events: 3, achievements: 6 } });
  }
}
