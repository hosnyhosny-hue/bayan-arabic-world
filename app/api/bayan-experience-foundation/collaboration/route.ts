import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const experienceId = searchParams.get("experienceId") || "family-experience-v3";
  const snapshot = await bayanDb().collection("bayan_experience_presence")
    .where("experienceId", "==", experienceId)
    .where("lastSeen", ">=", new Date(Date.now() - 30000)).get();
  return NextResponse.json({ ok: true, collaborators: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
}

export async function POST(request: Request) {
  const body = await request.json() as { experienceId: string; sessionId: string; name?: string; selectedSceneId?: string };
  await bayanDb().collection("bayan_experience_presence").doc(body.sessionId).set({
    experienceId: body.experienceId,
    name: body.name || "محرر",
    selectedSceneId: body.selectedSceneId || "",
    lastSeen: new Date(),
  }, { merge: true });
  return NextResponse.json({ ok: true });
}
