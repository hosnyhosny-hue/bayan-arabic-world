import fs from "node:fs";
import path from "node:path";

const worlds = ["school", "canteen", "market", "library", "hospital", "airport", "university"];
const stages = ["listen", "discover", "speak", "practice", "mission", "assessment"];
let missing = 0;

for (const world of worlds) {
  for (const stage of stages) {
    const file = path.join(process.cwd(), "public/audio/bayan/dialogue", world, `${stage}.mp3`);
    if (!fs.existsSync(file) || fs.statSync(file).size < 1024) {
      console.error(`Missing: ${file}`);
      missing += 1;
    }
  }
}

if (missing > 0) {
  console.error(`Missing ${missing} professional dialogue files.`);
  process.exit(1);
}

console.log("✓ All 42 professional dialogue files are present.");
