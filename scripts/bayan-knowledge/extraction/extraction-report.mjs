import path from "node:path";
import { loadQueue, reportsDir, writeJson } from "./queue-lib.mjs";
const q = loadQueue(),
  byStatus = q.jobs.reduce(
    (r, j) => ((r[j.status] = (r[j.status] ?? 0) + 1), r),
    {},
  ),
  report = {
    generatedAt: new Date().toISOString(),
    totalJobs: q.jobs.length,
    byStatus,
    totalAttempts: q.jobs.reduce((s, j) => s + Number(j.attempt ?? 0), 0),
    failures: q.jobs
      .filter((j) => j.status === "failed")
      .map((j) => ({
        id: j.id,
        sourceId: j.sourceId,
        attempt: j.attempt,
        lastError: j.lastError,
      })),
    pendingReview: q.jobs
      .filter((j) => j.status === "needs-review")
      .map((j) => ({
        id: j.id,
        sourceId: j.sourceId,
        artifactPath: j.artifactPath,
        pageCount: j.metadata?.estimatedPageCount ?? null,
      })),
  };
const f = path.join(reportsDir, "extraction-report.json");
writeJson(f, report);
console.log("BAYAN Extraction Report\n=======================");
console.log(`Total jobs: ${report.totalJobs}`);
for (const [k, v] of Object.entries(byStatus)) console.log(`- ${k}: ${v}`);
console.log(`Failures: ${report.failures.length}`);
console.log(`Pending review: ${report.pendingReview.length}`);
