import { loadManifest, removeUndefined, saveManifest } from "./source-lib.mjs";

const manifest = loadManifest();
const now = new Date().toISOString();

manifest.sources = manifest.sources.map((source) =>
  removeUndefined({
    ...source,
    sourceType: source.sourceType ?? "reference",
    language: source.language ?? "ar",
    license: source.license ?? "reference-only",
    updatedAt: source.updatedAt ?? source.registeredAt ?? now,
    lifecycle: source.lifecycle ?? source.extractionStatus ?? "registered",
    reviewStatus: source.reviewStatus ?? "pending",
    tags: Array.isArray(source.tags) ? source.tags : [],
  }),
);

saveManifest(manifest);
console.log(`✓ Source manifest migrated to version 2`);
console.log(`✓ ${manifest.sources.length} source record(s) retained`);
