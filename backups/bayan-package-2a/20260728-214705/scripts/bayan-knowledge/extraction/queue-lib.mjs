import fs from "node:fs";
import path from "node:path";
export const root = process.cwd();
export const extractionRoot = path.join(
  root,
  "app/learn/arabic-b/knowledge/extraction",
);
export const queuePath = path.join(extractionRoot, "queue.json");
export const manifestPath = path.join(
  root,
  "app/learn/arabic-b/knowledge/sources/manifest.json",
);
export const reportsDir = path.join(extractionRoot, "reports");
export const artifactsDir = path.join(extractionRoot, "artifacts");
export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}
export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith("--")) continue;
    const k = t.slice(2),
      n = argv[i + 1];
    if (!n || n.startsWith("--")) out[k] = true;
    else {
      out[k] = n;
      i++;
    }
  }
  return out;
}
export const now = () => new Date().toISOString();
export function loadQueue() {
  if (!fs.existsSync(queuePath)) return { version: 1, updatedAt: "", jobs: [] };
  const q = readJson(queuePath);
  return {
    version: Number(q.version ?? 1),
    updatedAt: q.updatedAt ?? "",
    jobs: Array.isArray(q.jobs) ? q.jobs : [],
  };
}
export function saveQueue(q) {
  q.updatedAt = now();
  q.jobs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  writeJson(queuePath, q);
}
export const loadManifest = () => readJson(manifestPath);
export function saveManifest(m) {
  m.updatedAt = now();
  writeJson(manifestPath, m);
}
export const makeJobId = (s) =>
  `extract-${s.id}-${s.checksumSha256.slice(0, 8)}`;
export function makeJob(s) {
  const t = now();
  return {
    id: makeJobId(s),
    sourceId: s.id,
    sourceChecksum: s.checksumSha256,
    fileName: s.fileName,
    mediaType: s.mediaType,
    originalPath: s.originalPath,
    status: "queued",
    attempt: 0,
    maxAttempts: 3,
    createdAt: t,
    updatedAt: t,
    startedAt: null,
    completedAt: null,
    nextAttemptAt: t,
    lastError: null,
    artifactPath: null,
    metadata: null,
    history: [{ at: t, from: null, to: "queued", reason: "Job created" }],
  };
}
