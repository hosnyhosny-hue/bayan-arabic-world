import { processJob } from "./extract-one.mjs";
import { loadQueue } from "./queue-lib.mjs";
let n = 0;
while (
  loadQueue().jobs.some(
    (j) =>
      j.status === "queued" &&
      new Date(j.nextAttemptAt).getTime() <= Date.now(),
  )
) {
  processJob();
  n++;
}
console.log(`✓ Processing cycle complete: ${n} job(s)`);
