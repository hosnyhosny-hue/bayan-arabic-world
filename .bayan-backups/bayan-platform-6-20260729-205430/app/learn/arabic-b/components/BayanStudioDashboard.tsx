"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

import {
  BAYAN_STUDIO_STORAGE_KEY,
  DEFAULT_BAYAN_STUDIO_PROJECT,
} from "../lib/bayan-studio-defaults";
import type {
  BayanCharacter,
  BayanMission,
  BayanStudioProject,
  BayanWorld,
  BayanVoiceAsset,
} from "../lib/bayan-studio-schema";

import styles from "../bayan-studio.module.css";

type StudioTab =
  | "overview"
  | "worlds"
  | "characters"
  | "voices"
  | "assets"
  | "tutor";

function cloneProject(project: BayanStudioProject): BayanStudioProject {
  return JSON.parse(JSON.stringify(project)) as BayanStudioProject;
}

function loadProject(): BayanStudioProject {
  if (typeof window === "undefined") {
    return cloneProject(DEFAULT_BAYAN_STUDIO_PROJECT);
  }

  const saved = window.localStorage.getItem(BAYAN_STUDIO_STORAGE_KEY);
  if (!saved) return cloneProject(DEFAULT_BAYAN_STUDIO_PROJECT);

  try {
    return JSON.parse(saved) as BayanStudioProject;
  } catch {
    return cloneProject(DEFAULT_BAYAN_STUDIO_PROJECT);
  }
}

function scoreProject(project: BayanStudioProject): number {
  const voiceReady = project.voices.filter((item) => item.status === "ready").length;
  const ambienceReady = project.ambience.filter((item) => item.status === "ready").length;
  const missionCount = project.worlds.reduce(
    (sum, world) => sum + world.missions.length,
    0,
  );

  const total =
    project.voices.length +
    project.ambience.length +
    Math.max(missionCount, 1);

  return Math.round(
    ((voiceReady + ambienceReady + missionCount) / Math.max(total, 1)) * 100,
  );
}

export default function BayanStudioDashboard() {
  const [project, setProject] = useState<BayanStudioProject>(() => loadProject());
  const [tab, setTab] = useState<StudioTab>("overview");
  const [selectedWorldId, setSelectedWorldId] = useState(
    project.worlds[0]?.id ?? "",
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedWorld = project.worlds.find(
    (world) => world.id === selectedWorldId,
  );

  const readiness = useMemo(() => scoreProject(project), [project]);

  function commit(next: BayanStudioProject): void {
    const updated = {
      ...next,
      updatedAt: new Date().toISOString(),
    };
    setProject(updated);
    window.localStorage.setItem(
      BAYAN_STUDIO_STORAGE_KEY,
      JSON.stringify(updated),
    );
  }

  function updateCharacter(
    id: string,
    patch: Partial<BayanCharacter>,
  ): void {
    commit({
      ...project,
      characters: project.characters.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function updateVoice(
    id: string,
    patch: Partial<BayanVoiceAsset>,
  ): void {
    commit({
      ...project,
      voices: project.voices.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function addWorld(): void {
    const index = project.worlds.length + 1;
    const world: BayanWorld = {
      id: `world-${index}`,
      titleAr: "عالم جديد",
      titleEn: `World ${index}`,
      level: "A0",
      icon: "🌍",
      color: "#356cf6",
      locationAr: "موقع جديد",
      characterIds: [],
      missions: [],
    };
    commit({ ...project, worlds: [...project.worlds, world] });
    setSelectedWorldId(world.id);
    setTab("worlds");
  }

  function addMission(worldId: string): void {
    const mission: BayanMission = {
      id: `mission-${Date.now()}`,
      titleAr: "مهمة جديدة",
      titleEn: "New mission",
      xp: 20,
      scenes: [
        {
          id: "intro",
          kind: "intro",
          eyebrowAr: "المشهد",
          titleAr: "بداية المهمة",
          bodyAr: "اكتب وصف المشهد هنا.",
        },
        {
          id: "result",
          kind: "result",
          eyebrowAr: "النتيجة",
          titleAr: "اكتملت المهمة",
          bodyAr: "تم حفظ التقدم.",
        },
      ],
    };

    commit({
      ...project,
      worlds: project.worlds.map((world) =>
        world.id === worldId
          ? { ...world, missions: [...world.missions, mission] }
          : world,
      ),
    });
  }

  function exportProject(): void {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bayan-studio-project.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importProject(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = JSON.parse(String(reader.result)) as BayanStudioProject;
        commit(next);
        setSelectedWorldId(next.worlds[0]?.id ?? "");
      } catch {
        window.alert("ملف المشروع غير صالح.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function resetProject(): void {
    if (!window.confirm("هل تريد إعادة المشروع إلى النسخة الافتراضية؟")) return;
    const fresh = cloneProject(DEFAULT_BAYAN_STUDIO_PROJECT);
    commit(fresh);
    setSelectedWorldId(fresh.worlds[0]?.id ?? "");
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div>ب</div>
          <span>
            <strong>BAYAN Studio</strong>
            <small>Platform 5.0</small>
          </span>
        </div>

        <nav>
          {[
            ["overview", "نظرة عامة", "◫"],
            ["worlds", "World Builder", "🌍"],
            ["characters", "الشخصيات", "◉"],
            ["voices", "Voice Studio", "◖"],
            ["assets", "Asset Manager", "▣"],
            ["tutor", "AI Tutor", "✦"],
          ].map(([id, label, icon]) => (
            <button
              className={tab === id ? styles.navActive : styles.navItem}
              key={id}
              onClick={() => setTab(id as StudioTab)}
              type="button"
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span>جاهزية المنصة</span>
          <strong>{readiness}%</strong>
          <div><i style={{ width: `${readiness}%` }} /></div>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <small>الإدارة الموحدة</small>
            <h1>منصة بناء تجارب BAYAN</h1>
          </div>
          <div className={styles.topActions}>
            <input
              accept="application/json"
              hidden
              onChange={importProject}
              ref={fileInputRef}
              type="file"
            />
            <button onClick={() => fileInputRef.current?.click()} type="button">
              استيراد
            </button>
            <button onClick={exportProject} type="button">تصدير JSON</button>
            <button className={styles.primary} onClick={addWorld} type="button">
              + عالم جديد
            </button>
          </div>
        </header>

        {tab === "overview" && (
          <div className={styles.content}>
            <div className={styles.metricGrid}>
              <article>
                <span>العوالم</span>
                <strong>{project.worlds.length}</strong>
                <small>World Builder</small>
              </article>
              <article>
                <span>الشخصيات</span>
                <strong>{project.characters.length}</strong>
                <small>Stable identities</small>
              </article>
              <article>
                <span>الأصول الصوتية</span>
                <strong>{project.voices.length}</strong>
                <small>
                  {project.voices.filter((item) => item.status === "ready").length} جاهز
                </small>
              </article>
              <article>
                <span>المؤثرات</span>
                <strong>{project.ambience.length}</strong>
                <small>Immersive ambience</small>
              </article>
            </div>

            <div className={styles.overviewGrid}>
              <article className={styles.panel}>
                <div className={styles.panelTitle}>
                  <div>
                    <small>Platform pipeline</small>
                    <h2>رحلة إنتاج العالم</h2>
                  </div>
                  <span>{readiness}%</span>
                </div>
                {[
                  ["الهوية والشخصيات", project.characters.length > 0],
                  ["المهام والمشاهد", project.worlds.some((w) => w.missions.length > 0)],
                  ["الأصوات الاحترافية", project.voices.some((v) => v.status === "ready")],
                  ["المؤثرات البيئية", project.ambience.some((a) => a.status === "ready")],
                  ["إعداد المعلّم الذكي", project.tutor.enabled],
                ].map(([label, done]) => (
                  <div className={styles.checkRow} key={String(label)}>
                    <span>{done ? "✓" : "○"}</span>
                    <strong>{String(label)}</strong>
                    <small>{done ? "جاهز" : "يحتاج إعدادًا"}</small>
                  </div>
                ))}
              </article>

              <article className={styles.darkPanel}>
                <small>Next release</small>
                <h2>من لوحة واحدة إلى منصة قابلة للنشر</h2>
                <p>
                  أنشئ العالم، اربط الشخصية، أضف الحوار المشكّل،
                  حدّد ملف الصوت، ثم صدّر المشروع بصيغة JSON.
                </p>
                <button onClick={() => setTab("worlds")} type="button">
                  افتح World Builder
                </button>
              </article>
            </div>
          </div>
        )}

        {tab === "worlds" && (
          <div className={styles.builder}>
            <div className={styles.worldList}>
              <div className={styles.listHeader}>
                <span>العوالم</span>
                <button onClick={addWorld} type="button">+</button>
              </div>
              {project.worlds.map((world) => (
                <button
                  className={
                    selectedWorldId === world.id
                      ? styles.worldActive
                      : styles.worldItem
                  }
                  key={world.id}
                  onClick={() => setSelectedWorldId(world.id)}
                  type="button"
                >
                  <span>{world.icon}</span>
                  <div>
                    <strong>{world.titleAr}</strong>
                    <small>{world.level} · {world.missions.length} مهام</small>
                  </div>
                </button>
              ))}
            </div>

            {selectedWorld && (
              <div className={styles.editor}>
                <div className={styles.editorHero}>
                  <span style={{ background: selectedWorld.color }}>
                    {selectedWorld.icon}
                  </span>
                  <div>
                    <small>{selectedWorld.titleEn}</small>
                    <h2>{selectedWorld.titleAr}</h2>
                    <p>{selectedWorld.locationAr}</p>
                  </div>
                  <button
                    onClick={() => addMission(selectedWorld.id)}
                    type="button"
                  >
                    + مهمة
                  </button>
                </div>

                <div className={styles.missionGrid}>
                  {selectedWorld.missions.map((mission) => (
                    <article key={mission.id}>
                      <div>
                        <small>{mission.titleEn}</small>
                        <h3>{mission.titleAr}</h3>
                      </div>
                      <span>{mission.xp} XP</span>
                      <p>{mission.scenes.length} مشاهد تفاعلية</p>
                      <div className={styles.sceneDots}>
                        {mission.scenes.map((scene) => (
                          <i key={scene.id} title={scene.kind} />
                        ))}
                      </div>
                    </article>
                  ))}
                  {selectedWorld.missions.length === 0 && (
                    <div className={styles.empty}>
                      <strong>لا توجد مهام بعد</strong>
                      <p>أنشئ أول مهمة لهذا العالم.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "characters" && (
          <div className={styles.content}>
            <div className={styles.sectionTitle}>
              <div>
                <small>Character System</small>
                <h2>هوية ثابتة لكل شخصية</h2>
              </div>
            </div>
            <div className={styles.cardGrid}>
              {project.characters.map((character) => (
                <article className={styles.formCard} key={character.id}>
                  <div className={styles.avatar}>{character.avatar}</div>
                  <label>
                    الاسم العربي
                    <input
                      value={character.nameAr}
                      onChange={(event) =>
                        updateCharacter(character.id, {
                          nameAr: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    الدور
                    <input
                      value={character.roleAr}
                      onChange={(event) =>
                        updateCharacter(character.id, {
                          roleAr: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Voice ID
                    <input
                      value={character.voiceId}
                      onChange={(event) =>
                        updateCharacter(character.id, {
                          voiceId: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    الأسلوب الصوتي
                    <textarea
                      value={character.style}
                      onChange={(event) =>
                        updateCharacter(character.id, {
                          style: event.target.value,
                        })
                      }
                    />
                  </label>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "voices" && (
          <div className={styles.content}>
            <div className={styles.sectionTitle}>
              <div>
                <small>Voice Studio</small>
                <h2>سجل الأصوات الاحترافية</h2>
              </div>
            </div>
            <div className={styles.voiceTable}>
              {project.voices.map((voice) => (
                <article key={voice.id}>
                  <div className={styles.status} data-status={voice.status}>
                    {voice.status}
                  </div>
                  <div>
                    <small>{voice.worldId} / {voice.missionId}</small>
                    <strong>{voice.vocalizedText}</strong>
                    <code>{voice.audioPath}</code>
                  </div>
                  <select
                    value={voice.status}
                    onChange={(event) =>
                      updateVoice(voice.id, {
                        status: event.target.value as BayanVoiceAsset["status"],
                      })
                    }
                  >
                    <option value="missing">missing</option>
                    <option value="draft">draft</option>
                    <option value="ready">ready</option>
                  </select>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "assets" && (
          <div className={styles.content}>
            <div className={styles.sectionTitle}>
              <div>
                <small>Asset Manager</small>
                <h2>ملفات الصوت والمؤثرات</h2>
              </div>
            </div>
            <div className={styles.assetGrid}>
              {project.ambience.map((asset) => (
                <article key={asset.id}>
                  <span>♫</span>
                  <div>
                    <strong>{asset.labelAr}</strong>
                    <code>{asset.audioPath}</code>
                  </div>
                  <small>{Math.round(asset.volume * 100)}%</small>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "tutor" && (
          <div className={styles.content}>
            <div className={styles.sectionTitle}>
              <div>
                <small>AI Tutor Configuration</small>
                <h2>سياسة التصحيح والتغذية الراجعة</h2>
              </div>
            </div>
            <article className={styles.tutorPanel}>
              <label>
                <span>تشغيل المعلّم الذكي</span>
                <input
                  checked={project.tutor.enabled}
                  onChange={(event) =>
                    commit({
                      ...project,
                      tutor: {
                        ...project.tutor,
                        enabled: event.target.checked,
                      },
                    })
                  }
                  type="checkbox"
                />
              </label>
              <label>
                <span>درجة النطق المطلوبة</span>
                <input
                  max="100"
                  min="0"
                  onChange={(event) =>
                    commit({
                      ...project,
                      tutor: {
                        ...project.tutor,
                        minimumPronunciationScore: Number(event.target.value),
                      },
                    })
                  }
                  type="range"
                  value={project.tutor.minimumPronunciationScore}
                />
                <strong>{project.tutor.minimumPronunciationScore}%</strong>
              </label>
              <label>
                <span>لغة التغذية الراجعة</span>
                <select
                  onChange={(event) =>
                    commit({
                      ...project,
                      tutor: {
                        ...project.tutor,
                        feedbackLanguage: event.target.value as
                          | "ar"
                          | "en"
                          | "bilingual",
                      },
                    })
                  }
                  value={project.tutor.feedbackLanguage}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="bilingual">ثنائي اللغة</option>
                </select>
              </label>
            </article>
          </div>
        )}

        <footer className={styles.footer}>
          <span>آخر حفظ: {new Date(project.updatedAt).toLocaleString("ar-QA")}</span>
          <button onClick={resetProject} type="button">إعادة الضبط</button>
        </footer>
      </section>
    </main>
  );
}
