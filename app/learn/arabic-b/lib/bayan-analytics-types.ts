export type LearningEvent = {
  type:
    | "mission_started"
    | "scene_viewed"
    | "listen_played"
    | "speech_assessed"
    | "choice_answered"
    | "scene_completed"
    | "mission_completed";
  learnerId: string;
  learnerName?: string;
  classId?: string;
  worldId: string;
  missionId: string;
  sceneId?: string;
  skill?: string;
  score?: number;
  pronunciationScore?: number;
  seconds?: number;
  attempt?: number;
  success?: boolean;
  provider?: string;
};
