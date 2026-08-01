import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

function serialize(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if ("toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(serialize);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, serialize(item)])
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.max(1, Math.min(Number(searchParams.get("limit") || 6), 12));

    let query: FirebaseFirestore.Query = bayanDb()
      .collection("bayan_social_posts")
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc")
      .limit(limit);

    if (cursor && cursor !== "initial") {
      const cursorDoc = await bayanDb().collection("bayan_social_posts").doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => {
      const data = serialize(doc.data()) as Record<string, unknown>;
      return {
        id: doc.id,
        title: String(data.title || "تحديث جديد"),
        excerpt: String(data.excerpt || data.content || data.caption || ""),
        image: String(data.imageUrl || data.coverUrl || "/images/bayan/pulse-feed-1.jpg"),
        category: String(data.category || data.type || "نبض بيان"),
        publishedAt: data.publishedAt,
      };
    });

    return NextResponse.json({
      ok: true,
      items,
      nextCursor: snapshot.docs.length === limit ? snapshot.docs.at(-1)?.id || null : null,
    });
  } catch (error) {
    console.error("[Pulse infinite feed]", error);
    return NextResponse.json({ ok: false, items: [], nextCursor: null }, { status: 500 });
  }
}
