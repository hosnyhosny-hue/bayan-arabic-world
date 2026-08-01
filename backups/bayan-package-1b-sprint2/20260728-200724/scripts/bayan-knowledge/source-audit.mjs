import path from "node:path";
import { loadManifest, reportsDir, writeJson } from "./source-lib.mjs";

const manifest = loadManifest();

const countBy = (key) =>
  manifest.sources.reduce((result, source) => {
    const value = String(source[key] ?? "unknown");
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});

const duplicateChecksums = Object.entries(
  manifest.sources.reduce((result, source) => {
    (result[source.checksumSha256] ??= []).push(source.id);
    return result;
  }, {}),
)
  .filter(([, ids]) => ids.length > 1)
  .map(([checksum, ids]) => ({ checksum, sourceIds: ids }));

const report = {
  generatedAt: new Date().toISOString(),
  totalSources: manifest.sources.length,
  byType: countBy("sourceType"),
  byLifecycle: countBy("lifecycle"),
  byReviewStatus: countBy("reviewStatus"),
  byLanguage: countBy("language"),
  duplicateChecksums,
  sourcesWithoutOriginalPath: manifest.sources
    .filter((source) => !source.originalPath)
    .map((source) => source.id),
};

const file = path.join(reportsDir, "source-audit.json");
writeJson(file, report);

console.log("BAYAN Source Audit");
console.log("==================");
console.log(`Total sources: ${report.totalSources}`);
console.log(`Duplicate checksums: ${report.duplicateChecksums.length}`);
console.log(
  `Missing original path: ${report.sourcesWithoutOriginalPath.length}`,
);
console.log(`✓ Audit written to ${path.relative(process.cwd(), file)}`);
