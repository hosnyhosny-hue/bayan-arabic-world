import { loadQueue } from "./queue-lib.mjs";
const q = loadQueue();
console.log("BAYAN Extraction Queue\n======================");
if (!q.jobs.length) {
  console.log("No extraction jobs.");
  process.exit(0);
}
for (const j of q.jobs) {
  console.log(
    `- ${j.id} | ${j.status} | attempt ${j.attempt}/${j.maxAttempts}`,
  );
  console.log(`  ${j.fileName}`);
}
