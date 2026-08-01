import fs from "node:fs";
import path from "node:path";
import { extractPdfMetadata } from "./pdf-metadata.mjs";
import {
  artifactsDir,
  loadManifest,
  loadQueue,
  now,
  saveManifest,
  saveQueue,
  writeJson,
} from "./queue-lib.mjs";
function trans(j, to, reason) {
  const from = j.status;
  j.status = to;
  j.updatedAt = now();
  j.history.push({ at: j.updatedAt, from, to, reason });
}
export function processJob(jobId = null) {
  const q = loadQueue(),
    m = loadManifest();
  const j =
    q.jobs.find((x) => x.id === jobId) ??
    q.jobs.find(
      (x) =>
        x.status === "queued" &&
        new Date(x.nextAttemptAt).getTime() <= Date.now(),
    );
  if (!j) {
    console.log("No queued extraction job available.");
    return false;
  }
  const s = m.sources.find((x) => x.id === j.sourceId);
  if (!s) throw new Error(`Source not found for job ${j.id}`);
  try {
    trans(j, "extracting", "Worker claimed job");
    j.startedAt = now();
    j.attempt++;
    s.lifecycle = "extracting";
    saveQueue(q);
    saveManifest(m);
    if (!j.originalPath || !fs.existsSync(j.originalPath))
      throw new Error(`Source file missing: ${j.originalPath}`);
    const md = extractPdfMetadata(j.originalPath),
      a = path.join(artifactsDir, `${j.sourceId}.metadata.json`);
    writeJson(a, {
      jobId: j.id,
      sourceId: j.sourceId,
      extractedAt: now(),
      metadata: md,
    });
    j.metadata = md;
    j.artifactPath = path.relative(process.cwd(), a);
    j.completedAt = now();
    trans(j, "needs-review", "Metadata extracted");
    s.lifecycle = "needs-review";
    s.reviewStatus = "pending";
    s.pageCount = md.estimatedPageCount ?? s.pageCount;
    s.author = s.author || md.author || undefined;
    saveQueue(q);
    saveManifest(m);
    console.log(`✓ Extracted: ${j.id}`);
    console.log(`  pages: ${md.estimatedPageCount ?? "unknown"}`);
    return true;
  } catch (e) {
    j.lastError = e instanceof Error ? e.message : String(e);
    trans(j, "failed", j.lastError);
    s.lifecycle = "registered";
    saveQueue(q);
    saveManifest(m);
    console.error(`✗ ${j.id}: ${j.lastError}`);
    return false;
  }
}
