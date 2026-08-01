import fs from "node:fs";
import { loadManifest, loadQueue } from "./queue-lib.mjs";
const q = loadQueue(),
  m = loadManifest(),
  sourceIds = new Set((m.sources ?? []).map((s) => s.id)),
  jobIds = new Set();
let e = 0;
for (const j of q.jobs) {
  if (jobIds.has(j.id)) {
    console.error(`✗ Duplicate job id: ${j.id}`);
    e++;
  }
  jobIds.add(j.id);
  if (!sourceIds.has(j.sourceId)) {
    console.error(`✗ Missing source: ${j.id}`);
    e++;
  }
  if (
    ["needs-review", "approved", "indexed"].includes(j.status) &&
    (!j.artifactPath || !fs.existsSync(j.artifactPath))
  ) {
    console.error(`✗ Missing artifact: ${j.id}`);
    e++;
  }
  if (j.attempt > j.maxAttempts) {
    console.error(`✗ Attempt limit exceeded: ${j.id}`);
    e++;
  }
}
if (e) {
  console.error(`✗ Extraction verification failed: ${e}`);
  process.exit(1);
}
console.log(`✓ Extraction verification passed: ${q.jobs.length} job(s)`);
