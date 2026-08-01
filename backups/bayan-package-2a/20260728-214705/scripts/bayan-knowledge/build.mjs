import path from "node:path";
import {
  generatedDir,
  rawLessonsDir,
  readJson,
  unique,
  walkJson,
  writeJson,
} from "./lib.mjs";

const lessons = walkJson(rawLessonsDir).map(readJson);

const vocabularyMap = new Map();
const grammarMap = new Map();
const byTheme = {};
const byCefr = {};
const bySkill = {};
const byWorld = {};

for (const lesson of lessons) {
  for (const entry of lesson.vocabulary) {
    const existing = vocabularyMap.get(entry.id);
    vocabularyMap.set(entry.id, {
      ...(existing ?? entry),
      ...entry,
      lessonIds: unique([...(existing?.lessonIds ?? []), lesson.id]),
      cefr: unique([...(existing?.cefr ?? []), lesson.cefr]),
      themes: unique([...(existing?.themes ?? []), lesson.theme]),
      worldIds: unique([...(existing?.worldIds ?? []), ...lesson.worldIds]),
    });
  }

  for (const entry of lesson.grammar) {
    const existing = grammarMap.get(entry.id);
    grammarMap.set(entry.id, {
      ...(existing ?? entry),
      ...entry,
      lessonIds: unique([...(existing?.lessonIds ?? []), lesson.id]),
      cefr: unique([...(existing?.cefr ?? []), lesson.cefr]),
    });
  }

  (byTheme[lesson.theme] ??= []).push(lesson.id);
  (byCefr[lesson.cefr] ??= []).push(lesson.id);

  for (const skill of lesson.skills) {
    (bySkill[skill] ??= []).push(lesson.id);
  }
  for (const worldId of lesson.worldIds) {
    (byWorld[worldId] ??= []).push(lesson.id);
  }
}

const lessonSummaries = lessons.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  grade: lesson.grade,
  cefr: lesson.cefr,
  theme: lesson.theme,
  worldIds: lesson.worldIds,
  skills: lesson.skills,
  objectiveCount: lesson.objectives.length,
  vocabularyCount: lesson.vocabulary.length,
  grammarCount: lesson.grammar.length,
  dialogueCount: lesson.dialogues.length,
  readingCount: lesson.readings.length,
  activityCount: lesson.activities.length,
  sourceCount: lesson.sources.length,
  status: lesson.status,
  version: lesson.version,
}));

const now = new Date().toISOString();

writeJson(path.join(generatedDir, "lessons.json"), {
  generatedAt: now,
  items: lessons,
});

writeJson(path.join(generatedDir, "vocabulary-index.json"), {
  generatedAt: now,
  total: vocabularyMap.size,
  items: [...vocabularyMap.values()].sort((a, b) =>
    a.arabic.localeCompare(b.arabic, "ar"),
  ),
});

writeJson(path.join(generatedDir, "grammar-index.json"), {
  generatedAt: now,
  total: grammarMap.size,
  items: [...grammarMap.values()].sort((a, b) =>
    a.title.localeCompare(b.title),
  ),
});

writeJson(path.join(generatedDir, "theme-index.json"), {
  generatedAt: now,
  items: byTheme,
});

writeJson(path.join(generatedDir, "cefr-index.json"), {
  generatedAt: now,
  items: byCefr,
});

writeJson(path.join(generatedDir, "skill-index.json"), {
  generatedAt: now,
  items: bySkill,
});

writeJson(path.join(generatedDir, "world-index.json"), {
  generatedAt: now,
  items: byWorld,
});

writeJson(path.join(generatedDir, "knowledge-index.json"), {
  generatedAt: now,
  totals: {
    lessons: lessons.length,
    vocabulary: vocabularyMap.size,
    grammar: grammarMap.size,
    dialogues: lessons.reduce((sum, item) => sum + item.dialogues.length, 0),
    readings: lessons.reduce((sum, item) => sum + item.readings.length, 0),
    activities: lessons.reduce((sum, item) => sum + item.activities.length, 0),
  },
  lessons: lessonSummaries,
  indexes: {
    vocabulary: "vocabulary-index.json",
    grammar: "grammar-index.json",
    themes: "theme-index.json",
    cefr: "cefr-index.json",
    skills: "skill-index.json",
    worlds: "world-index.json",
  },
});

console.log("✓ Knowledge indexes generated");
console.log(`  lessons: ${lessons.length}`);
console.log(`  vocabulary: ${vocabularyMap.size}`);
console.log(`  grammar: ${grammarMap.size}`);
