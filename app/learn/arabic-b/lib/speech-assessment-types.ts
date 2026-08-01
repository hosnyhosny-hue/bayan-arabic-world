export type SpeechAssessmentResult = {
  provider: "azure" | "openai" | "local";
  transcript: string;
  overallScore: number;
  accuracyScore: number;
  fluencyScore?: number;
  completenessScore?: number;
  pronunciationScore?: number;
  feedbackAr: string[];
  words: Array<{
    word: string;
    accuracy?: number;
    errorType?: string;
  }>;
};
