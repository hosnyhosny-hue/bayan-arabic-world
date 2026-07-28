"use client";

import { useMemo } from "react";
import { useJourneyEngine } from "../core/JourneyEngineProvider";
import { loadPublishedWorlds, loadWorld } from "./loader";

export function useJourneyWorlds() {
  const engine = useJourneyEngine();

  const worlds = useMemo(
    () =>
      loadPublishedWorlds().map((worldPackage) => {
        const worldId = worldPackage.world.id;

        return {
          ...worldPackage,
          progress: engine.getWorldProgress(worldId),
          status: engine.state.worlds[worldId].status,
          earnedXp: engine.state.worlds[worldId].earnedXp,
        };
      }),
    [engine],
  );

  const currentWorld = useMemo(
    () => loadWorld(engine.currentWorldId),
    [engine.currentWorldId],
  );

  return {
    ...engine,
    worlds,
    currentWorld,
  };
}
