import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "bayan_pulse_content",
  "bayan_channels",
  "bayan_pulse_stories",
  "bayan_social_posts",
  "bayan_events",
  "bayan_achievements",
  "bayan_media",
]);

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

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      collection?: string;
      limit?: number;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
      filters?: Array<{ field: string; operator: "==" | "array-contains"; value: string }>;
    };

    const collection = String(body.collection || "");
    if (!ALLOWED.has(collection)) {
      return NextResponse.json({ ok: false, items: [], error: "Unsupported collection" }, { status: 400 });
    }

    let query: FirebaseFirestore.Query = bayanDb().collection(collection);

    for (const filter of body.filters || []) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    if (body.orderBy) {
      query = query.orderBy(body.orderBy, body.orderDirection || "desc");
    }

    query = query.limit(Math.max(1, Math.min(Number(body.limit || 12), 50)));

    const snapshot = await query.get();
    const items: Array<Record<string, unknown>> = snapshot.docs.map((doc) => {
      const data = serialize(doc.data()) as Record<string, unknown>;
      return { id: doc.id, ...data };
    });

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("[Experience Foundation data]", error);
    return NextResponse.json({ ok: true, items: [], degraded: true });
  }
}
