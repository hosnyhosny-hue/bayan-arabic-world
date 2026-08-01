import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

function serialize(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if ("toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(serialize);
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k,v]) => [k, serialize(v)]));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requested = Number(searchParams.get("limit") || "20");
    const limit = Math.max(1, Math.min(Number.isFinite(requested) ? requested : 20, 50));
    const snapshot = await bayanDb().collection("bayan_social_posts").where("status", "==", "published").limit(limit).get();
    const posts = snapshot.docs
      .map<Record<string, unknown>>((doc) => {
      const data = serialize(doc.data()) as Record<string, unknown>;
      return { id: doc.id, ...data };
    })
      .filter((post) => ["public", "all", "school", "community"].includes(String(post.visibility || post.audience || "public").toLowerCase()))
      .sort((a,b) => new Date(String(b.publishedAt || b.createdAt || 0)).getTime() - new Date(String(a.publishedAt || a.createdAt || 0)).getTime());
    return NextResponse.json({ ok: true, mode: "guest", capabilities: { view: true, interact: false, comment: false, publish: false }, posts });
  } catch (error) {
    console.error("[BAYAN public feed]", error);
    return NextResponse.json({ ok: true, mode: "guest", capabilities: { view: true, interact: false, comment: false, publish: false }, posts: [], degraded: true });
  }
}
