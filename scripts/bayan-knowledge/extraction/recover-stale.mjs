import {
  loadManifest,
  loadQueue,
  now,
  saveManifest,
  saveQueue,
} from "./queue-lib.mjs";
const q = loadQueue(),
  m = loadManifest();
let n = 0;
for (const j of q.jobs) {
  if (
    j.status === "extracting" &&
    Date.now() - new Date(j.updatedAt).getTime() > 1800000
  ) {
    const from = j.status;
    j.status = "queued";
    j.updatedAt = now();
    j.nextAttemptAt = now();
    j.lastError = "Recovered stale extraction claim";
    j.history.push({
      at: j.updatedAt,
      from,
      to: "queued",
      reason: j.lastError,
    });
    const s = m.sources.find((x) => x.id === j.sourceId);
    if (s) s.lifecycle = "queued";
    n++;
  }
}
saveQueue(q);
saveManifest(m);
console.log(`✓ Recovered stale jobs: ${n}`);
