import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const apiKey = process.env.ELEVENLABS_API_KEY;
const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128";

if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY.");
  process.exit(1);
}

const worlds = ["school", "canteen", "market", "library", "hospital", "airport", "university"];
const stages = ["listen", "discover", "speak", "practice", "mission", "assessment"];
const voiceEnv = Object.fromEntries(worlds.map((world) => [world, `ELEVENLABS_VOICE_${world.toUpperCase()}`]));

const manifestPath = path.join(root, "app/learn/arabic-b/lib/bayan-voice-manifest.ts");
const manifestSource = await fs.readFile(manifestPath, "utf8");

function extractDialogue(world, stage) {
  const worldStart = manifestSource.indexOf(`  ${world}: {`, manifestSource.indexOf("DIACRITIZED_DIALOGUES"));
  const nextWorldPositions = worlds
    .map((item) => manifestSource.indexOf(`  ${item}: {`, worldStart + 1))
    .filter((value) => value > worldStart);
  const worldEnd = nextWorldPositions.length ? Math.min(...nextWorldPositions) : manifestSource.indexOf("};", worldStart);
  const block = manifestSource.slice(worldStart, worldEnd);
  const match = block.match(new RegExp(`\\n\\s+${stage}: \\"([^\\"]+)\\"`));
  return match?.[1] || null;
}

async function createSpeech(voiceId, text, destination) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.68,
        similarity_boost: 0.82,
        style: 0.12,
        use_speaker_boost: true,
        speed: 0.88,
      },
    }),
  });
  if (!response.ok) throw new Error(`TTS ${response.status}: ${await response.text()}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function createAmbience(prompt, destination) {
  const response = await fetch(`https://api.elevenlabs.io/v1/sound-generation?output_format=${outputFormat}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text: prompt, duration_seconds: 18, prompt_influence: 0.35, loop: true }),
  });
  if (!response.ok) throw new Error(`SFX ${response.status}: ${await response.text()}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

const ambiencePrompts = {
  school: "Modern international school hallway ambience, soft distant students, gentle school bell, no intelligible speech, calm educational atmosphere",
  canteen: "Warm modern cafe ambience, soft cups and plates, quiet espresso machine, subtle room tone, no intelligible speech",
  market: "Clean indoor market ambience, soft footsteps, bags and checkout sounds, distant nonverbal crowd murmur",
  library: "Quiet modern library ambience, gentle page turns, distant footsteps, soft air conditioning, no speech",
  hospital: "Calm modern clinic ambience, soft distant medical equipment, quiet reception room, no alarms and no speech",
  airport: "Spacious modern airport terminal ambience, rolling luggage, distant announcement texture without intelligible words",
  university: "Modern university campus interior ambience, subtle footsteps and distant room tone, no intelligible speech",
};

for (const world of worlds) {
  const voiceId = process.env[voiceEnv[world]];
  if (!voiceId) throw new Error(`Missing ${voiceEnv[world]}`);

  for (const stage of stages) {
    const text = extractDialogue(world, stage);
    if (!text) throw new Error(`Missing vocalized text for ${world}/${stage}`);
    const destination = path.join(root, "public/audio/bayan/dialogue", world, `${stage}.mp3`);
    console.log(`Generating ${world}/${stage}…`);
    await createSpeech(voiceId, text, destination);
  }

  if (process.env.BAYAN_GENERATE_AMBIENCE === "1") {
    const destination = path.join(root, "public/audio/bayan/ambience", `${world}.mp3`);
    console.log(`Generating ambience ${world}…`);
    await createAmbience(ambiencePrompts[world], destination);
  }
}

console.log("✓ BAYAN professional audio generated.");
