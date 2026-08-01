import { NextRequest, NextResponse } from "next/server";

import { authorizeBayanAdmin } from "../../../../learn/arabic-b/lib/bayan-platform-auth";
import { getBayanFirestore } from "../../../../learn/arabic-b/lib/bayan-platform-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!authorizeBayanAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getBayanFirestore()
    .collection("bayanLearningEvents")
    .orderBy("createdAt", "desc")
    .limit(2000)
    .get();

  const map = new Map<string, {
    learnerId: string;
    learnerName: string;
    attempts: number;
    completed: number;
    scoreTotal: number;
    scoreCount: number;
    pronunciationTotal: number;
    pronunciationCount: number;
    seconds: number;
    skills: Record<string, { total: number; count: number }>;
  }>();

  for (const doc of snapshot.docs) {
    const event = doc.data();
    const id = String(event.learnerId);
    const row = map.get(id) ?? {
      learnerId: id,
      learnerName: String(event.learnerName ?? id),
      attempts: 0,
      completed: 0,
      scoreTotal: 0,
      scoreCount: 0,
      pronunciationTotal: 0,
      pronunciationCount: 0,
      seconds: 0,
      skills: {},
    };

    if (event.type === "speech_assessed") row.attempts += 1;
    if (event.type === "mission_completed") row.completed += 1;
    row.seconds += Number(event.seconds ?? 0);

    if (typeof event.score === "number") {
      row.scoreTotal += event.score;
      row.scoreCount += 1;
    }

    if (typeof event.pronunciationScore === "number") {
      row.pronunciationTotal += event.pronunciationScore;
      row.pronunciationCount += 1;
    }

    if (event.skill && typeof event.score === "number") {
      const skill = row.skills[event.skill] ?? { total: 0, count: 0 };
      skill.total += event.score;
      skill.count += 1;
      row.skills[event.skill] = skill;
    }

    map.set(id, row);
  }

  const learners = [...map.values()].map((row) => {
    const weakest = Object.entries(row.skills)
      .map(([skill, value]) => ({
        skill,
        score: value.total / value.count,
      }))
      .sort((a, b) => a.score - b.score)[0];

    return {
      learnerId: row.learnerId,
      learnerName: row.learnerName,
      attempts: row.attempts,
      completedMissions: row.completed,
      averageScore: row.scoreCount
        ? Math.round(row.scoreTotal / row.scoreCount)
        : 0,
      pronunciationAverage: row.pronunciationCount
        ? Math.round(row.pronunciationTotal / row.pronunciationCount)
        : 0,
      totalSeconds: row.seconds,
      weakestSkill: weakest?.skill ?? "—",
    };
  });

  return NextResponse.json({
    learners,
    eventCount: snapshot.size,
    generatedAt: new Date().toISOString(),
  });
}
