import type { MissionType, NormalizedMission, SubmissionResult } from "./types";

type RecordValue = Record<string, unknown>;

const missionTypes: MissionType[] = [
  "conversation",
  "listening",
  "reading",
  "writing",
  "vocabulary",
  "grammar",
  "drag-drop",
  "ordering",
  "recording",
  "pronunciation",
];

const localized = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const item = value as RecordValue;
    return String(item.en ?? item.ar ?? fallback);
  }
  return fallback;
};

const pick = (record: RecordValue, keys: string[], fallback = "") => {
  for (const key of keys) {
    if (record[key] !== undefined) return localized(record[key], fallback);
  }
  return fallback;
};

const clean = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export function normalizeMission(
  worldId: string,
  raw: RecordValue,
  index: number,
): NormalizedMission {
  const rawType = String(raw.type ?? raw.activityType ?? "").toLowerCase();
  const type = missionTypes.includes(rawType as MissionType)
    ? (rawType as MissionType)
    : missionTypes[index % missionTypes.length];

  const expectedAnswer = pick(
    raw,
    ["expectedAnswer", "answer", "correctAnswer", "modelAnswer"],
    type === "ordering" || type === "drag-drop" ? "أَهْلًا وَسَهْلًا" : "",
  );

  const sourceChoices =
    (Array.isArray(raw.choices) && raw.choices) ||
    (Array.isArray(raw.options) && raw.options) ||
    [];

  const choices = sourceChoices.map((choice, choiceIndex) => {
    if (typeof choice === "string") {
      return {
        id: `choice-${choiceIndex + 1}`,
        label: choice,
        correct: clean(choice) === clean(expectedAnswer),
      };
    }
    const item = choice as RecordValue;
    return {
      id: String(item.id ?? `choice-${choiceIndex + 1}`),
      label: localized(item.label ?? item.text ?? item.value),
      correct: Boolean(item.correct ?? item.isCorrect),
    };
  });

  if (choices.length && !choices.some((choice) => choice.correct)) {
    choices[0] = { ...choices[0], correct: true };
  }

  const finalChoices =
    choices.length > 0
      ? choices
      : [
          {
            id: "correct",
            label: expectedAnswer || "أَهْلًا وَسَهْلًا",
            correct: true,
          },
          { id: "wrong-1", label: "مَعَ السَّلامَة", correct: false },
          { id: "wrong-2", label: "لا أَعْرِف", correct: false },
        ];

  const sourceTokens =
    (Array.isArray(raw.tokens) && raw.tokens) ||
    (Array.isArray(raw.words) && raw.words) ||
    (expectedAnswer ? expectedAnswer.split(" ") : ["وَسَهْلًا", "أَهْلًا"]);

  const title = pick(raw, ["title", "name"], `Mission ${index + 1}`);
  const prompt = pick(raw, ["prompt", "question", "task", "objective"], title);
  const passage = pick(raw, ["passage", "text", "readingText"]);

  return {
    id: String(raw.id ?? `${worldId}-mission-${index + 1}`),
    worldId,
    type,
    title,
    instruction: pick(
      raw,
      ["instruction", "description", "objective"],
      "Complete this learning activity.",
    ),
    prompt,
    passage,
    audioText: pick(
      raw,
      ["audioText", "listenText", "speech"],
      passage || prompt,
    ),
    expectedAnswer,
    choices: finalChoices,
    tokens: sourceTokens.map(String),
    xp: typeof raw.xp === "number" ? raw.xp : 20,
    passingScore: typeof raw.passingScore === "number" ? raw.passingScore : 70,
  };
}

export function assessText(
  mission: NormalizedMission,
  answer: string,
): SubmissionResult {
  const expected = clean(mission.expectedAnswer);
  const actual = clean(answer);

  if (!expected) {
    const correct = actual.length >= 2;
    return {
      score: correct ? 100 : 0,
      correct,
      feedback: correct
        ? "Excellent effort. Your answer has been accepted."
        : "Write a fuller answer and try again.",
    };
  }

  if (actual === expected) {
    return {
      score: 100,
      correct: true,
      feedback: "Excellent — exactly right.",
    };
  }

  const expectedWords = new Set(expected.split(" "));
  const actualWords = new Set(actual.split(" "));
  const overlap = [...actualWords].filter((word) =>
    expectedWords.has(word),
  ).length;
  const score = Math.round((overlap / Math.max(1, expectedWords.size)) * 100);

  return {
    score,
    correct: score >= mission.passingScore,
    feedback:
      score >= mission.passingScore
        ? "Good answer. You included the key language."
        : "Not quite yet. Review the prompt and try again.",
  };
}

export function trackLearningEvent(
  mission: NormalizedMission,
  action: string,
  score?: number,
) {
  if (typeof window === "undefined") return;
  try {
    const key = "bayan-arabic-b-learning-events-v1";
    const previous = JSON.parse(
      window.localStorage.getItem(key) ?? "[]",
    ) as unknown[];
    const next = [
      ...previous,
      {
        worldId: mission.worldId,
        missionId: mission.id,
        type: mission.type,
        action,
        score,
        timestamp: Date.now(),
      },
    ].slice(-500);
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Analytics must never block learning.
  }
}
