export type CEFRLevel = "A0" | "A1" | "A2" | "B1" | "B2";
export type Skill =
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "vocabulary"
  | "grammar"
  | "pronunciation"
  | "culture";

export type SourceReference = {
  sourceId: string;
  pageStart?: number;
  pageEnd?: number;
  note?: string;
};

export type VocabularyEntry = {
  id: string;
  arabic: string;
  transliteration?: string;
  english?: string;
  partOfSpeech?: string;
  gender?: "masculine" | "feminine" | "common";
  root?: string;
  tags?: string[];
};

export type GrammarEntry = {
  id: string;
  title: string;
  description?: string;
  examples?: string[];
  prerequisiteIds?: string[];
};

export type ActivitySeed = {
  id: string;
  type:
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
  instruction: string;
  prompt?: string;
  expectedAnswer?: string;
  choices?: Array<{ id: string; label: string; correct?: boolean }>;
  tokens?: string[];
};

export type KnowledgeLesson = {
  id: string;
  title: string;
  grade?: number;
  cefr: CEFRLevel;
  theme: string;
  worldIds: string[];
  skills: Skill[];
  objectives: string[];
  vocabulary: VocabularyEntry[];
  grammar: GrammarEntry[];
  dialogues: Array<{
    id: string;
    title?: string;
    turns: Array<{ speaker: string; text: string; translation?: string }>;
  }>;
  readings: Array<{
    id: string;
    title: string;
    text: string;
    questions?: string[];
  }>;
  activities: ActivitySeed[];
  sources: SourceReference[];
  status: "draft" | "reviewed" | "approved";
  version: number;
  updatedAt: string;
};
