import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

import type { LearningEvent } from "../../../../../learn/arabic-b/lib/bayan-analytics-types";
import { getBayanFirestore } from "../../../../../learn/arabic-b/lib/bayan-platform-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as LearningEvent;

    if (!event.type || !event.learnerId || !event.worldId || !event.missionId) {
      return NextResponse.json(
        { error: "Missing required analytics fields" },
        { status: 400 },
      );
    }

    await getBayanFirestore().collection("bayanLearningEvents").add({
      ...event,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to record analytics event",
      },
      { status: 500 },
    );
  }
}
