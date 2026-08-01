import schoolWorld from "../../content/worlds/school/world.json";
import schoolScenes from "../../content/worlds/school/scenes.json";
import schoolMissions from "../../content/worlds/school/missions.json";
import schoolVocabulary from "../../content/worlds/school/vocabulary.json";
import schoolCharacters from "../../content/worlds/school/characters.json";

import canteenWorld from "../../content/worlds/canteen/world.json";
import canteenScenes from "../../content/worlds/canteen/scenes.json";
import canteenMissions from "../../content/worlds/canteen/missions.json";
import canteenVocabulary from "../../content/worlds/canteen/vocabulary.json";
import canteenCharacters from "../../content/worlds/canteen/characters.json";

import libraryWorld from "../../content/worlds/library/world.json";
import libraryScenes from "../../content/worlds/library/scenes.json";
import libraryMissions from "../../content/worlds/library/missions.json";
import libraryVocabulary from "../../content/worlds/library/vocabulary.json";
import libraryCharacters from "../../content/worlds/library/characters.json";

import marketWorld from "../../content/worlds/market/world.json";
import marketScenes from "../../content/worlds/market/scenes.json";
import marketMissions from "../../content/worlds/market/missions.json";
import marketVocabulary from "../../content/worlds/market/vocabulary.json";
import marketCharacters from "../../content/worlds/market/characters.json";

import hospitalWorld from "../../content/worlds/hospital/world.json";
import hospitalScenes from "../../content/worlds/hospital/scenes.json";
import hospitalMissions from "../../content/worlds/hospital/missions.json";
import hospitalVocabulary from "../../content/worlds/hospital/vocabulary.json";
import hospitalCharacters from "../../content/worlds/hospital/characters.json";

import airportWorld from "../../content/worlds/airport/world.json";
import airportScenes from "../../content/worlds/airport/scenes.json";
import airportMissions from "../../content/worlds/airport/missions.json";
import airportVocabulary from "../../content/worlds/airport/vocabulary.json";
import airportCharacters from "../../content/worlds/airport/characters.json";

import universityWorld from "../../content/worlds/university/world.json";
import universityScenes from "../../content/worlds/university/scenes.json";
import universityMissions from "../../content/worlds/university/missions.json";
import universityVocabulary from "../../content/worlds/university/vocabulary.json";
import universityCharacters from "../../content/worlds/university/characters.json";

import type { WorldId } from "../core/types";
import type { WorldPackage } from "./types";

function asPackage(value: WorldPackage): WorldPackage {
  return value;
}

export const WORLD_REGISTRY: Record<WorldId, WorldPackage> = {
  school: asPackage({
    world: schoolWorld,
    scenes: schoolScenes,
    missions: schoolMissions,
    vocabulary: schoolVocabulary,
    characters: schoolCharacters,
  } as WorldPackage),
  canteen: asPackage({
    world: canteenWorld,
    scenes: canteenScenes,
    missions: canteenMissions,
    vocabulary: canteenVocabulary,
    characters: canteenCharacters,
  } as WorldPackage),
  library: asPackage({
    world: libraryWorld,
    scenes: libraryScenes,
    missions: libraryMissions,
    vocabulary: libraryVocabulary,
    characters: libraryCharacters,
  } as WorldPackage),
  market: asPackage({
    world: marketWorld,
    scenes: marketScenes,
    missions: marketMissions,
    vocabulary: marketVocabulary,
    characters: marketCharacters,
  } as WorldPackage),
  hospital: asPackage({
    world: hospitalWorld,
    scenes: hospitalScenes,
    missions: hospitalMissions,
    vocabulary: hospitalVocabulary,
    characters: hospitalCharacters,
  } as WorldPackage),
  airport: asPackage({
    world: airportWorld,
    scenes: airportScenes,
    missions: airportMissions,
    vocabulary: airportVocabulary,
    characters: airportCharacters,
  } as WorldPackage),
  university: asPackage({
    world: universityWorld,
    scenes: universityScenes,
    missions: universityMissions,
    vocabulary: universityVocabulary,
    characters: universityCharacters,
  } as WorldPackage),
};
