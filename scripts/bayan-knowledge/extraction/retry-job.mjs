import {
  loadManifest,
  loadQueue,
  now,
  parseArgs,
  saveManifest,
  saveQueue,
} from "./queue-lib.mjs";
import { assertTransition } from "./state-machine.mjs";
const a = parseArgs(process.argv.slice(2));
if (!a.job) {
  console.error("Usage: npm run bayan:extract:retry -- --job <job-id>");
  process.exit(1);
}
const q = loadQueue(),
  m = loadManifest(),
  j = q.jobs.find((x) => x.id === a.job);
if (!j) {
  console.error(`Job not found: ${a.job}`);
  process.exit(1);
}
if (!["failed", "rejected", "cancelled", "needs-review"].includes(j.status)) {
  console.error(`Job cannot be retried from status: ${j.status}`);
  process.exit(1);
}
if (j.attempt >= j.maxAttempts && !a.force) {
  console.error("Maximum attempts reached. Use --force.");
  process.exit(1);
}
assertTransition(j.status, "queued");
const from = j.status;
j.status = "queued";
j.updatedAt = now();
j.nextAttemptAt = now();
j.lastError = null;
j.completedAt = null;
j.history.push({
  at: j.updatedAt,
  from,
  to: "queued",
  reason: a.reason ?? "Manual retry",
});
const s = m.sources.find((x) => x.id === j.sourceId);
if (s) {
  s.lifecycle = "queued";
  s.reviewStatus = "pending";
  s.updatedAt = now();
}
saveQueue(q);
saveManifest(m);
console.log(`✓ Job requeued: ${j.id}`);
