import type { JourneyWorldId } from "./journey-types";

export type SceneChoice = {
  id: string;
  labelAr: string;
  feedbackAr: string;
  correct: boolean;
};

export type MissionScene = {
  id: string;
  kind: "intro" | "listen" | "choice" | "speak" | "result";
  eyebrowAr: string;
  titleAr: string;
  bodyAr: string;
  speakerAr?: string;
  audioTextAr?: string;
  modelAnswerAr?: string;
  promptAr?: string;
  hintAr?: string;
  choices?: SceneChoice[];
};

export type StageSceneExperience = {
  worldId: JourneyWorldId;
  stageId: string;
  stageTitleAr: string;
  stageTitleEn: string;
  icon: string;
  xp: number;
  scenes: MissionScene[];
};
