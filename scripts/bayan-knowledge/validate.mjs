import path from "node:path";
import { rawLessonsDir, walkJson, readJson } from "./lib.mjs";

const CEFR = new Set(["A0", "A1", "A2", "B1", "B2"]);
const STATUSES = new Set(["draft", "reviewed", "approved"]);
const SKILLS = new Set([
  "listening",
  "speaking",
  "reading",
  "writing",
  "vocabulary",
  "grammar",
  "pronunciation",
  "culture",
]);

const requiredArrays = [
  "worldIds",
  "skills",
  "objectives",
  "vocabulary",
  "grammar",
  "dialogues",
  "readings",
  "activities",
  "sources",
];

function validateLesson(file, lesson) {
  const errors = [];
  const label = path.relative(process.cwd(), file);

  if (!lesson || typeof lesson !== "object") errors.push("must be an object");
  if (!lesson.id || typeof lesson.id !== "string")
    errors.push("id is required");
  if (!lesson.title || typeof lesson.title !== "string")
    errors.push("title is required");
  if (!CEFR.has(lesson.cefr)) errors.push(`invalid cefr: ${lesson.cefr}`);
  if (!STATUSES.has(lesson.status))
    errors.push(`invalid status: ${lesson.status}`);
  if (!Number.isInteger(lesson.version) || lesson.version < 1)
    errors.push("version must be a positive integer");

  for (const key of requiredArrays) {
    if (!Array.isArray(lesson[key])) errors.push(`${key} must be an array`);
  }

  for (const skill of lesson.skills ?? []) {
    if (!SKILLS.has(skill)) errors.push(`unknown skill: ${skill}`);
  }

  const vocabularyIds = new Set();
  for (const entry of lesson.vocabulary ?? []) {
    if (!entry.id || !entry.arabic) {
      errors.push("every vocabulary entry needs id and arabic");
      continue;
    }
    if (vocabularyIds.has(entry.id)) {
      errors.push(`duplicate vocabulary id: ${entry.id}`);
    }
    vocabularyIds.add(entry.id);
  }

  const activityIds = new Set();
  for (const activity of lesson.activities ?? []) {
    if (!activity.id || !activity.type || !activity.instruction) {
      errors.push("every activity needs id, type and instruction");
      continue;
    }
    if (activityIds.has(activity.id)) {
      errors.push(`duplicate activity id: ${activity.id}`);
    }
    activityIds.add(activity.id);
  }

  return { label, errors };
}

const files = walkJson(rawLessonsDir);
if (files.length === 0) {
  console.error("No lesson JSON files found.");
  process.exit(1);
}

let failed = false;
for (const file of files) {
  const result = validateLesson(file, readJson(file));
  if (result.errors.length) {
    failed = true;
    console.error(`✗ ${result.label}`);
    for (const error of result.errors) console.error(`  - ${error}`);
  } else {
    console.log(`✓ ${result.label}`);
  }
}

if (failed) process.exit(1);
console.log(`✓ ${files.length} knowledge lesson(s) validated`);
