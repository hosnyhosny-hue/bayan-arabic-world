import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

type StudioPayload = {
  id?: string;
  kind?: string;
  title?: string;
  excerpt?: string;
  status?: string;
  audience?: string;
  author?: string;
  updatedAt?: string;
  scheduledAt?: string;
  coverUrl?: string;
  category?: string;
};

function normalize(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    ...data,
    updatedAt: data.updatedAt && typeof data.updatedAt === "object" && "toDate" in data.updatedAt
      ? (data.updatedAt as FirebaseFirestore.Timestamp).toDate().toISOString()
      : data.updatedAt,
    scheduledAt: data.scheduledAt && typeof data.scheduledAt === "object" && "toDate" in data.scheduledAt
      ? (data.scheduledAt as FirebaseFirestore.Timestamp).toDate().toISOString()
      : data.scheduledAt,
  };
}

export async function GET() {
  try {
    const snapshot = await bayanDb()
      .collection("bayan_pulse_content")
      .orderBy("updatedAt", "desc")
      .limit(100)
      .get();

    return NextResponse.json({
      ok: true,
      items: snapshot.docs.map(normalize),
    });
  } catch (error) {
    console.error("[Pulse Studio GET]", error);
    return NextResponse.json({ ok: true, items: [], degraded: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as StudioPayload;
    const id = body.id || bayanDb().collection("bayan_pulse_content").doc().id;
    const now = new Date();

    const payload = {
      kind: body.kind || "post",
      title: body.title || "بدون عنوان",
      excerpt: body.excerpt || "",
      status: body.status || "draft",
      audience: body.audience || "public",
      author: body.author || "فريق بيان",
      category: body.category || "عام",
      coverUrl: body.coverUrl || "",
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      updatedAt: now,
      createdAt: now,
    };

    await bayanDb().collection("bayan_pulse_content").doc(id).set(payload, { merge: true });

    if (payload.status === "published" && ["post","event","achievement","gallery","video"].includes(payload.kind)) {
      await bayanDb().collection("bayan_social_posts").doc(id).set({
        title: payload.title,
        content: payload.excerpt,
        type: payload.kind,
        status: "published",
        visibility: payload.audience === "public" ? "public" : payload.audience,
        audience: payload.audience,
        authorName: payload.author,
        category: payload.category,
        imageUrl: payload.coverUrl,
        publishedAt: now,
        updatedAt: now,
      }, { merge: true });
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[Pulse Studio POST]", error);
    return NextResponse.json({ ok: false, error: "Unable to save content" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    await bayanDb().collection("bayan_pulse_content").doc(id).set({
      status: "archived",
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Pulse Studio DELETE]", error);
    return NextResponse.json({ ok: false, error: "Unable to archive content" }, { status: 500 });
  }
}
