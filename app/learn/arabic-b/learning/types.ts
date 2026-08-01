export type MissionType =
  | "conversation"
  | "listening"
  | "reading"
  | "writing"
  | "vocabulary"
  | "grammar"
  | "drag-drop"
  | "ordering"
  | "recording"
  | "pronunciation";

export type Choice = { id: string; label: string; correct?: boolean };

export type NormalizedMission = {
  id: string;
  worldId: string;
  type: MissionType;
  title: string;
  instruction: string;
  prompt: string;
  passage: string;
  audioText: string;
  expectedAnswer: string;
  choices: Choice[];
  tokens: string[];
  xp: number;
  passingScore: number;
};

export type SubmissionResult = {
  score: number;
  correct: boolean;
  feedback: string;
};
