import { NextRequest, NextResponse } from "next/server";

import { authorizeBayanAdmin } from "../../../../learn/arabic-b/lib/bayan-platform-auth";
import { getBayanFirestore } from "../../../../learn/arabic-b/lib/bayan-platform-admin";

const bayanDb = getBayanFirestore();

export const runtime = "nodejs";

type SkillAggregate = {
  total: number;
  count: number;
};

type LearnerAggregate = {
  learnerId: string;
  learnerName: string;
  attempts: number;
  completed: number;
  scoreTotal: number;
  scoreCount: number;
  pronunciationTotal: number;
  pronunciationCount: number;
  seconds: number;
  skills: Record<string, SkillAggregate>;
};

export async function GET(request: NextRequest) {
  if (!authorizeBayanAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await bayanDb
      .collection("bayanLearningEvents")
      .orderBy("createdAt", "desc")
      .limit(2000)
      .get();

    const learners = new Map<string, LearnerAggregate>();

    for (const document of snapshot.docs) {
      const event = document.data();
      const learnerId = String(event.learnerId ?? "").trim();
      if (!learnerId) continue;

      const row = learners.get(learnerId) ?? {
        learnerId,
        learnerName: String(event.learnerName ?? learnerId),
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

      if (typeof event.skill === "string" && typeof event.score === "number") {
        const skill = row.skills[event.skill] ?? { total: 0, count: 0 };
        skill.total += event.score;
        skill.count += 1;
        row.skills[event.skill] = skill;
      }

      learners.set(learnerId, row);
    }

    const summaries = [...learners.values()].map((row) => {
      const weakestSkill =
        Object.entries(row.skills)
          .map(([skill, value]) => ({
            skill,
            average: value.total / value.count,
          }))
          .sort((a, b) => a.average - b.average)[0]?.skill ?? "—";

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
        weakestSkill,
      };
    });

    return NextResponse.json({
      learners: summaries,
      eventCount: snapshot.size,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load analytics",
      },
      { status: 500 },
    );
  }
}
