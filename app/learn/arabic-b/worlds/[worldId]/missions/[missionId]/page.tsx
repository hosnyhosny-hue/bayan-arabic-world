import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArabicBSceneMission from "../../../../components/ArabicBSceneMission";
import { getWorldContent, isWorldId } from "../../../../lib/world-content";
import { getStageSceneExperience } from "../../../../lib/world-scene-content";

type MissionPageProps = {
  params: Promise<{ worldId: string; missionId: string }>;
};

export const metadata: Metadata = {
  title: "BAYAN Arabic B | Story Mission",
  description: "Interactive Arabic story mission with listening, speaking and feedback.",
};

export default async function MissionPage({ params }: MissionPageProps) {
  const { worldId, missionId } = await params;
  if (!isWorldId(worldId)) notFound();

  const world = getWorldContent(worldId);
  const experience = getStageSceneExperience(worldId, missionId);
  if (!experience) notFound();

  return <ArabicBSceneMission experience={experience} world={world} />;
}
