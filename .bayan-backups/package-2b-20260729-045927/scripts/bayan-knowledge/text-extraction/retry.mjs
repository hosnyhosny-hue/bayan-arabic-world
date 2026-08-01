import { loadTextManifest, parseArgs, saveTextManifest } from "./lib.mjs";
import { processSource } from "./process-source.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.source) {
  console.error("Usage: npm run bayan:text:retry -- --source <source-id>");
  process.exit(1);
}

const manifest = loadTextManifest();
const item = manifest.items.find(
  (candidate) => candidate.sourceId === args.source,
);

if (item && !["failed", "ocr-required"].includes(item.status) && !args.force) {
  console.error(`Source status is ${item.status}. Use --force to re-extract.`);
  process.exit(1);
}

manifest.items = manifest.items.filter(
  (candidate) => candidate.sourceId !== args.source,
);
saveTextManifest(manifest);

const success = processSource(args.source);
process.exit(success ? 0 : 1);
