import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  rawLessonsDir,
  readJson,
  slugify,
  writeJson,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.file) {
  console.error(
    'Usage: npm run bayan:knowledge:import -- --file "/path/lesson.json"',
  );
  process.exit(1);
}

const source = path.resolve(String(args.file));
if (!fs.existsSync(source)) {
  console.error(`Lesson file not found: ${source}`);
  process.exit(1);
}

const lesson = readJson(source);
if (!lesson.id) lesson.id = slugify(lesson.title ?? path.basename(source));
if (!lesson.updatedAt) lesson.updatedAt = new Date().toISOString();
if (!lesson.version) lesson.version = 1;
if (!lesson.status) lesson.status = "draft";

const destination = path.join(rawLessonsDir, `${lesson.id}.json`);
writeJson(destination, lesson);

console.log(`✓ Lesson imported: ${lesson.id}`);
console.log(`  ${path.relative(process.cwd(), destination)}`);
