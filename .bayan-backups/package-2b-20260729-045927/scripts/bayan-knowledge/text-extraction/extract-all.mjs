import { loadSources, loadTextManifest } from "./lib.mjs";
import { processSource } from "./process-source.mjs";

let processed = 0;

while (true) {
  const sources = loadSources();
  const manifest = loadTextManifest();
  const pending = (sources.sources ?? []).find((source) => {
    if (source.mediaType !== "application/pdf") return false;
    const existing = manifest.items.find((item) => item.sourceId === source.id);
    return !existing;
  });

  if (!pending) break;
  processSource(pending.id);
  processed += 1;
}

console.log(`✓ Text extraction cycle complete: ${processed} source(s)`);
