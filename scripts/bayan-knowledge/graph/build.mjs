import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));

const scripts = [
  "build-nodes.mjs",
  "build-edges.mjs",
  "build-indexes.mjs",
  "validate.mjs",
  "status.mjs",
];

for (const script of scripts) {
  const result = spawnSync(
    process.execPath,
    [path.join(directory, script)],
    {
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
