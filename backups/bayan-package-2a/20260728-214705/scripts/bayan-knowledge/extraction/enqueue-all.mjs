import {
  loadManifest,
  loadQueue,
  makeJob,
  saveManifest,
  saveQueue,
} from "./queue-lib.mjs";
const m = loadManifest(),
  q = loadQueue();
let created = 0,
  unchanged = 0;
for (const s of m.sources ?? []) {
  if (s.mediaType !== "application/pdf") {
    unchanged++;
    continue;
  }
  const e = q.jobs.find(
    (j) =>
      j.sourceId === s.id &&
      j.sourceChecksum === s.checksumSha256 &&
      j.status !== "cancelled",
  );
  if (e) {
    unchanged++;
    continue;
  }
  q.jobs.push(makeJob(s));
  s.lifecycle = "queued";
  s.updatedAt = new Date().toISOString();
  created++;
}
saveQueue(q);
saveManifest(m);
console.log("✓ Extraction enqueue complete");
console.log(`  created: ${created}`);
console.log(`  unchanged: ${unchanged}`);
console.log(`  total jobs: ${q.jobs.length}`);
