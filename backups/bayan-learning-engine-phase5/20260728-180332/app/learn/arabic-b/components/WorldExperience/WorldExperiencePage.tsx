"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useJourneyEngine } from "../../engine/core/JourneyEngineProvider";
import type { WorldId } from "../../engine/core/types";
import {
  getWorldExperience,
  type LocalizedText,
} from "../../engine/worlds/generated-world-experience-registry";
import styles from "./world-experience.module.css";

type UnknownRecord = Record<string, unknown>;

const text = (value: unknown, locale: "en" | "ar", fallback = "") => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const localized = value as Partial<LocalizedText>;
    return localized[locale] ?? localized.en ?? localized.ar ?? fallback;
  }
  return fallback;
};

const field = (
  record: UnknownRecord,
  keys: string[],
  locale: "en" | "ar",
  fallback = "",
) => {
  for (const key of keys) {
    if (key in record) {
      const result = text(record[key], locale, fallback);
      if (result) return result;
    }
  }
  return fallback;
};

const idOf = (record: UnknownRecord, fallback: string) =>
  typeof record.id === "string" ? record.id : fallback;

export default function WorldExperiencePage({ worldId }: { worldId: WorldId }) {
  const engine = useJourneyEngine();
  const world = getWorldExperience(worldId);
  const [isArabic, setIsArabic] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const locale = isArabic ? "ar" : "en";

  const progress = engine.state.worlds[worldId];
  const percentage = engine.getWorldProgress(worldId);

  const missions = useMemo(
    () => (world?.missions ?? []) as UnknownRecord[],
    [world],
  );

  if (!world) {
    return (
      <main className={styles.notFound}>
        <h1>World not found</h1>
        <Link href="/learn/arabic-b">Return to Journey Map</Link>
      </main>
    );
  }

  const startMission = (mission: UnknownRecord, index: number) => {
    const missionId = idOf(mission, `${worldId}-mission-${index + 1}`);
    engine.startWorld(worldId);
    setActiveMissionId(missionId);
  };

  const completeMission = (mission: UnknownRecord, index: number) => {
    const missionId = idOf(mission, `${worldId}-mission-${index + 1}`);
    const xp =
      typeof mission.xp === "number"
        ? mission.xp
        : Math.max(
            10,
            Math.round(world.xpReward / Math.max(1, missions.length)),
          );

    engine.completeMission(worldId, missionId, xp);
    setActiveMissionId(null);
  };

  return (
    <main className={styles.page} dir={isArabic ? "rtl" : "ltr"}>
      <nav className={styles.topbar}>
        <Link href="/learn/arabic-b" className={styles.back}>
          {isArabic ? "← خريطة الرحلة" : "← Journey Map"}
        </Link>
        <button
          type="button"
          className={styles.language}
          onClick={() => setIsArabic((value) => !value)}
        >
          {isArabic ? "English" : "العربية"}
        </button>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <span className={styles.kicker}>
            {world.level} · {progress.status}
          </span>
          <div className={styles.heroTitle}>
            <span aria-hidden="true">{world.icon}</span>
            <h1>{world.title[locale]}</h1>
          </div>
          <p>{world.description[locale]}</p>

          <div className={styles.heroStats}>
            <div>
              <strong>{world.missions.length}</strong>
              <span>{isArabic ? "مهمات" : "Missions"}</span>
            </div>
            <div>
              <strong>{world.vocabulary.length}</strong>
              <span>{isArabic ? "مفردات" : "Vocabulary"}</span>
            </div>
            <div>
              <strong>{world.scenes.length}</strong>
              <span>{isArabic ? "مشاهد" : "Scenes"}</span>
            </div>
            <div>
              <strong>{world.xpReward}</strong>
              <span>XP</span>
            </div>
          </div>
        </div>

        <aside className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span>{isArabic ? "تقدم العالم" : "World progress"}</span>
            <strong>{percentage}%</strong>
          </div>
          <div className={styles.progressBar}>
            <span style={{ width: `${percentage}%` }} />
          </div>
          <small>
            {progress.completedMissionIds.length}/{world.missions.length}{" "}
            {isArabic ? "مهمات مكتملة" : "missions completed"}
          </small>
          {world.badge[locale] ? (
            <div className={styles.heroBadge}>🏅 {world.badge[locale]}</div>
          ) : null}
        </aside>
      </section>

      <section className={styles.section}>
        <header>
          <span>01</span>
          <div>
            <h2>{isArabic ? "الشخصيات" : "Characters"}</h2>
            <p>
              {isArabic
                ? "تعرّف إلى الشخصيات التي سترافقك."
                : "Meet the people who guide the experience."}
            </p>
          </div>
        </header>
        <div className={styles.characterGrid}>
          {(world.characters as UnknownRecord[]).map((character, index) => (
            <article
              key={idOf(character, `character-${index}`)}
              className={styles.character}
            >
              <div className={styles.avatar}>
                {field(character, ["avatar", "emoji", "icon"], locale, "👤")}
              </div>
              <h3>
                {field(
                  character,
                  ["name", "title"],
                  locale,
                  `Character ${index + 1}`,
                )}
              </h3>
              <p>{field(character, ["role", "description"], locale)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header>
          <span>02</span>
          <div>
            <h2>{isArabic ? "المشاهد" : "Scenes"}</h2>
            <p>
              {isArabic
                ? "المواقف الحياتية التي يتكوّن منها العالم."
                : "The real-life situations inside this world."}
            </p>
          </div>
        </header>
        <div className={styles.sceneList}>
          {(world.scenes as UnknownRecord[]).map((scene, index) => (
            <article key={idOf(scene, `scene-${index}`)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>
                  {field(
                    scene,
                    ["title", "name"],
                    locale,
                    `Scene ${index + 1}`,
                  )}
                </h3>
                <p>{field(scene, ["description", "objective"], locale)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header>
          <span>03</span>
          <div>
            <h2>{isArabic ? "المهمات" : "Missions"}</h2>
            <p>
              {isArabic
                ? "ابدأ المهمة ثم أكملها ليُحفظ تقدمك وXP."
                : "Start and complete missions to save progress and XP."}
            </p>
          </div>
        </header>
        <div className={styles.missionGrid}>
          {missions.map((mission, index) => {
            const missionId = idOf(mission, `${worldId}-mission-${index + 1}`);
            const completed = progress.completedMissionIds.includes(missionId);
            const active = activeMissionId === missionId;
            return (
              <article
                key={missionId}
                className={`${styles.mission} ${completed ? styles.completed : ""}`}
              >
                <div className={styles.missionNumber}>{index + 1}</div>
                <div className={styles.missionContent}>
                  <span className={styles.missionType}>
                    {field(mission, ["type"], locale, "learning")}
                  </span>
                  <h3>
                    {field(
                      mission,
                      ["title", "name"],
                      locale,
                      `Mission ${index + 1}`,
                    )}
                  </h3>
                  <p>
                    {field(
                      mission,
                      ["description", "objective", "instruction"],
                      locale,
                    )}
                  </p>
                </div>
                <div className={styles.missionActions}>
                  {completed ? (
                    <span className={styles.done}>
                      ✓ {isArabic ? "مكتملة" : "Completed"}
                    </span>
                  ) : active ? (
                    <button
                      type="button"
                      onClick={() => completeMission(mission, index)}
                    >
                      {isArabic ? "إكمال المهمة" : "Complete mission"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startMission(mission, index)}
                    >
                      {isArabic ? "ابدأ المهمة" : "Start mission"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <header>
          <span>04</span>
          <div>
            <h2>{isArabic ? "المفردات" : "Vocabulary"}</h2>
            <p>
              {isArabic
                ? "الكلمات الأساسية لهذا العالم."
                : "Core words for this world."}
            </p>
          </div>
        </header>
        <div className={styles.vocabularyGrid}>
          {(world.vocabulary as UnknownRecord[]).map((item, index) => (
            <article key={idOf(item, `word-${index}`)}>
              <strong>
                {field(item, ["arabic", "wordAr", "term"], "ar", "—")}
              </strong>
              <span>
                {field(
                  item,
                  ["english", "wordEn", "meaning", "translation"],
                  "en",
                  "—",
                )}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header>
          <span>05</span>
          <div>
            <h2>{isArabic ? "الحوارات" : "Dialogues"}</h2>
            <p>
              {isArabic
                ? "حوار نموذجي داخل سياق العالم."
                : "Model conversations in context."}
            </p>
          </div>
        </header>
        <div className={styles.dialogueGrid}>
          {(world.dialogues as UnknownRecord[]).map((dialogue, index) => {
            const lines = Array.isArray(dialogue.lines)
              ? (dialogue.lines as UnknownRecord[])
              : [];
            return (
              <article
                key={idOf(dialogue, `dialogue-${index}`)}
                className={styles.dialogue}
              >
                <h3>
                  {field(
                    dialogue,
                    ["title", "name"],
                    locale,
                    `Dialogue ${index + 1}`,
                  )}
                </h3>
                <div>
                  {lines.map((line, lineIndex) => (
                    <p key={`${index}-${lineIndex}`}>
                      <b>{field(line, ["speaker"], locale, "Speaker")}</b>
                      <span lang="ar" dir="rtl">
                        {field(line, ["arabic"], "ar")}
                      </span>
                      <small>{field(line, ["english"], "en")}</small>
                    </p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
