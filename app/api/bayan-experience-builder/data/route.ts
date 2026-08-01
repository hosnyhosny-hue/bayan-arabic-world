import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

type Filter = {
  field: string;
  operator: "==" | "array-contains";
  value: string;
};

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

const ALLOWED_COLLECTIONS = new Set([
  "bayan_pulse_content",
  "bayan_channels",
  "bayan_pulse_stories",
  "bayan_social_posts",
  "bayan_quick_links",
  "bayan_events",
  "bayan_achievements",
  "bayan_media",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      source?: string;
      limit?: number;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
      filters?: Filter[];
    };

    const source = String(body.source || "");
    if (!ALLOWED_COLLECTIONS.has(source)) {
      return NextResponse.json({ ok: false, items: [], error: "Unsupported source" }, { status: 400 });
    }

    let query: FirebaseFirestore.Query = bayanDb().collection(source);

    for (const filter of body.filters || []) {
      if (!filter.field || !filter.value) continue;
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
    console.error("[Experience data]", error);
    return NextResponse.json({ ok: true, items: [], degraded: true });
  }
}
