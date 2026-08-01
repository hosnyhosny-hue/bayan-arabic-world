import type { JourneyWorldId } from "./journey-types";

export type WorldStageType =
  | "brief"
  | "listen"
  | "discover"
  | "speak"
  | "practice"
  | "mission"
  | "reward";

export type WorldStageContent = {
  id: string;
  type: WorldStageType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  instructionAr: string;
  xp: number;
  durationMinutes: number;
  icon: string;
};

export type WorldPhrase = {
  arabic: string;
  transliteration: string;
  english: string;
  useAr: string;
};

export type WorldCharacter = {
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  avatar: string;
  greetingAr: string;
};

export type WorldExperienceContent = {
  id: JourneyWorldId;
  level: string;
  icon: string;
  eyebrowAr: string;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  storyAr: string;
  storyEn: string;
  missionTitleAr: string;
  missionTitleEn: string;
  missionDescriptionAr: string;
  missionDescriptionEn: string;
  objectiveAr: string;
  accent: string;
  sceneEmoji: string;
  character: WorldCharacter;
  stages: WorldStageContent[];
  phrases: WorldPhrase[];
  successChecklist: string[];
  badgeAr: string;
  badgeEn: string;
  rewardXp: number;
};
