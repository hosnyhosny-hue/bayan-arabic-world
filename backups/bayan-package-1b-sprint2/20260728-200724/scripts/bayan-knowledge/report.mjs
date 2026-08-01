import path from "node:path";
import { generatedDir, readJson, sourceManifestPath } from "./lib.mjs";

const index = readJson(path.join(generatedDir, "knowledge-index.json"));
const manifest = readJson(sourceManifestPath);

console.log("BAYAN Knowledge Report");
console.log("======================");
console.log(`Sources registered : ${manifest.sources.length}`);
console.log(`Lessons            : ${index.totals.lessons}`);
console.log(`Vocabulary entries : ${index.totals.vocabulary}`);
console.log(`Grammar entries    : ${index.totals.grammar}`);
console.log(`Dialogues          : ${index.totals.dialogues}`);
console.log(`Readings           : ${index.totals.readings}`);
console.log(`Activities         : ${index.totals.activities}`);
console.log("");
console.log("Lesson status");
for (const lesson of index.lessons) {
  console.log(
    `- ${lesson.id}: ${lesson.status}, ${lesson.cefr}, ${lesson.activityCount} activities`,
  );
}
