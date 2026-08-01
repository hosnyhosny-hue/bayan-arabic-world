import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArabicBMissionExperience from "../../../../components/ArabicBMissionExperience";
import {
  getWorldContent,
  isWorldId,
} from "../../../../lib/world-content";

type MissionPageProps = {
  params: Promise<{
    worldId: string;
    missionId: string;
  }>;
};

export const metadata: Metadata = {
  title: "BAYAN Arabic B | Mission",
  description:
    "Complete an interactive real-life Arabic learning mission.",
};

export default async function MissionPage({
  params,
}: MissionPageProps) {
  const { worldId, missionId } = await params;

  if (!isWorldId(worldId)) {
    notFound();
  }

  const world = getWorldContent(worldId);
  const stage = world.stages.find(
    (item) => item.id.split(":")[1] === missionId,
  );

  if (!stage) {
    notFound();
  }

  return (
    <ArabicBMissionExperience
      stage={stage}
      world={world}
    />
  );
}
