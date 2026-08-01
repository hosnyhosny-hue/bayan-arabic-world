import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json() as { experienceId: string; label?: string; document: Record<string, unknown>; author?: string };
  const ref = bayanDb().collection("bayan_experience_versions").doc();
  await ref.set({
    experienceId: body.experienceId,
    label: body.label || "نسخة محفوظة",
    document: body.document,
    author: body.author || "editor",
    createdAt: new Date(),
  });
  return NextResponse.json({ ok: true, id: ref.id });
}
