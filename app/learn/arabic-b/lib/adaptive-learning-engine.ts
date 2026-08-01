export type MasterySkill =
  | "listening"
  | "speaking"
  | "vocabulary"
  | "interaction"
  | "fluency";

export type AdaptiveProfile = {
  learnerId: string;
  skills: Record<
    MasterySkill,
    {
      score: number;
      attempts: number;
      totalSeconds: number;
      lastPracticedAt?: string;
    }
  >;
  recentSceneIds: string[];
};

export type AdaptiveScene = {
  id: string;
  skill: MasterySkill;
  difficulty: number;
};

export function priority(
  scene: AdaptiveScene,
  profile: AdaptiveProfile,
): number {
  const skill = profile.skills[scene.skill];
  const weakness = 100 - skill.score;
  const lowPractice = Math.max(0, 5 - skill.attempts) * 4;
  const fit = 20 - Math.abs(scene.difficulty - skill.score / 20) * 4;
  const recentPenalty = profile.recentSceneIds.includes(scene.id) ? 22 : 0;
  return weakness * 0.55 + lowPractice + fit - recentPenalty;
}

export function orderScenesAdaptively(
  scenes: AdaptiveScene[],
  profile: AdaptiveProfile,
): AdaptiveScene[] {
  return [...scenes].sort(
    (a, b) => priority(b, profile) - priority(a, profile),
  );
}
