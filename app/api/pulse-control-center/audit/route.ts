import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      action: string;
      entityType: string;
      entityId?: string;
      entityTitle?: string;
      actorId?: string;
      actorName?: string;
      metadata?: Record<string, unknown>;
      tone?: "neutral" | "success" | "warning" | "danger";
    };

    const ref = bayanDb().collection("bayan_pulse_audit_logs").doc();
    await ref.set({ ...body, id: ref.id, createdAt: new Date() });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (error) {
    console.error("[Pulse Audit POST]", error);
    return NextResponse.json({ ok: false, error: "Unable to create audit log" }, { status: 500 });
  }
}
