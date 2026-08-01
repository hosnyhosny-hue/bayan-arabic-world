import { WORLD_ORDER } from "../core/catalog";
import type { WorldId } from "../core/types";
import { WORLD_REGISTRY } from "./registry";
import type { WorldPackage } from "./types";

export function loadWorld(worldId: WorldId): WorldPackage {
  const world = WORLD_REGISTRY[worldId];

  if (!world) {
    throw new Error(`Unknown BAYAN world: ${worldId}`);
  }

  return world;
}

export function loadPublishedWorlds(): WorldPackage[] {
  return WORLD_ORDER.map((worldId) => WORLD_REGISTRY[worldId]).filter(
    (world) => world.world.isPublished,
  );
}
