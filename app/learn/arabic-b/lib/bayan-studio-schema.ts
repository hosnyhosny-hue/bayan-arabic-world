export type BayanSceneKind =
  | "intro"
  | "listen"
  | "choice"
  | "speak"
  | "build"
  | "assessment"
  | "result";

export type BayanCharacter = {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  worldId: string;
  avatar: string;
  voiceProvider: "studio" | "elevenlabs" | "azure" | "openai";
  voiceId: string;
  locale: string;
  style: string;
  speed: number;
};

export type BayanVoiceAsset = {
  id: string;
  worldId: string;
  missionId: string;
  sceneId: string;
  characterId: string;
  text: string;
  vocalizedText: string;
  audioPath: string;
  status: "missing" | "draft" | "ready";
};

export type BayanAmbienceAsset = {
  id: string;
  worldId: string;
  labelAr: string;
  audioPath: string;
  volume: number;
  status: "missing" | "draft" | "ready";
};

export type BayanChoice = {
  id: string;
  labelAr: string;
  correct: boolean;
  feedbackAr: string;
};

export type BayanStudioScene = {
  id: string;
  kind: BayanSceneKind;
  eyebrowAr: string;
  titleAr: string;
  bodyAr: string;
  characterId?: string;
  voiceAssetId?: string;
  promptAr?: string;
  hintAr?: string;
  choices?: BayanChoice[];
  skill?: "listening" | "speaking" | "vocabulary" | "interaction" | "fluency";
  difficulty?: number;
  passScore?: number;
  adaptive?: boolean;
};

export type BayanMission = {
  id: string;
  titleAr: string;
  titleEn: string;
  xp: number;
  scenes: BayanStudioScene[];
};

export type BayanWorld = {
  id: string;
  titleAr: string;
  titleEn: string;
  level: string;
  icon: string;
  color: string;
  locationAr: string;
  ambienceAssetId?: string;
  characterIds: string[];
  missions: BayanMission[];
};

export type BayanTutorSettings = {
  enabled: boolean;
  correctionMode: "gentle" | "balanced" | "strict";
  revealTranscriptAfterListen: boolean;
  minimumPronunciationScore: number;
  maximumHints: number;
  feedbackLanguage: "ar" | "en" | "bilingual";
};

export type BayanStudioProject = {
  version: 1;
  updatedAt: string;
  characters: BayanCharacter[];
  voices: BayanVoiceAsset[];
  ambience: BayanAmbienceAsset[];
  worlds: BayanWorld[];
  tutor: BayanTutorSettings;
};
