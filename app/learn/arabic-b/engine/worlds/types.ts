import type { BadgeId, WorldId } from "../core/types";

export type LocalizedText = {
  en: string;
  ar: string;
};

export type WorldContent = {
  id: WorldId;
  title: LocalizedText;
  subtitle: LocalizedText;
  level: string;
  cefr: string;
  xpReward: number;
  badgeId: BadgeId | null;
  icon: string;
  theme: string;
  prerequisiteWorldId: WorldId | null;
  objectives: {
    en: string[];
    ar: string[];
  };
  estimatedMinutes: number;
  sceneIds: string[];
  missionIds: string[];
  characterIds: string[];
  isPublished: boolean;
  version: number;
};

export type WorldScene = {
  id: string;
  order: number;
  title: LocalizedText;
  description: LocalizedText;
  missionIds: string[];
};

export type WorldMission = {
  id: string;
  order: number;
  type: "story" | "practice" | "conversation" | "assessment";
  title: LocalizedText;
  xp: number;
  required: boolean;
};

export type WorldVocabularyItem = {
  id: string;
  arabic: string;
  english: string;
  transliteration: string;
  partOfSpeech: string;
  audio: string | null;
};

export type WorldCharacter = {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  avatar: string;
  voice: string;
  personality: string;
  difficulty: string;
};

export type WorldPackage = {
  world: WorldContent;
  scenes: WorldScene[];
  missions: WorldMission[];
  vocabulary: WorldVocabularyItem[];
  characters: WorldCharacter[];
};
