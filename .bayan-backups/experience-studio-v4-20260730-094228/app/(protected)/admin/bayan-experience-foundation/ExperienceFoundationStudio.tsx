"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./experience-foundation-studio.module.css";
import {
  defaultExperienceFoundation,
  type BindingValue,
  type ExperienceFoundationDocument,
  type ExperienceScene,
  type MotionPreset,
  type SceneType,
} from "@/packages/bayan-experience-foundation/src";

const sceneTypes: Array<{ type: SceneType; label: string; icon: string }> = [
  { type: "hero", label: "Hero", icon: "◫" },
  { type: "channels", label: "Channels", icon: "◎" },
  { type: "stories", label: "Stories", icon: "◉" },
  { type: "feed", label: "Feed", icon: "▤" },
  { type: "events", label: "Events", icon: "▦" },
  { type: "achievements", label: "Achievements", icon: "★" },
  { type: "gallery", label: "Gallery", icon: "▧" },
  { type: "arabicBee", label: "Arabic Bee", icon: "ض" },
  { type: "cta", label: "CTA", icon: "→" },
  { type: "custom", label: "Custom", icon: "+" },
];

function newScene(type: SceneType): ExperienceScene {
  const label = sceneTypes.find((item) => item.type === type)?.label || type;
  return {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    name: label,
    enabled: true,
    audience: "all",
    motion: "fade",
    data: { limit: 6, orderDirection: "desc" },
    bindings: {
      title: { mode: "static", value: label },
      subtitle: { mode: "static", value: "" },
    },
    style: { variant: "default", align: "start", minHeight: 220 },
  };
}

export default function ExperienceFoundationStudio() {
  const [experience, setExperience] = useState<ExperienceFoundationDocument>(defaultExperienceFoundation);
  const [selectedId, setSelectedId] = useState(defaultExperienceFoundation.scenes[0]?.id || "");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/bayan-experience-foundation?slug=parents", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (payload.experience) {
          setExperience(payload.experience);
          setSelectedId(payload.experience.scenes?.[0]?.id || "");
        }
      } catch {}
    }
    load();
  }, []);

  const selected = useMemo(
    () => experience.scenes.find((scene) => scene.id === selectedId) || null,
    [experience.scenes, selectedId]
  );

  function updateSelected(patch: Partial<ExperienceScene>) {
    setExperience((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => scene.id === selectedId ? { ...scene, ...patch } : scene),
    }));
  }

  function updateBinding(key: keyof NonNullable<ExperienceScene["bindings"]>, patch: Partial<BindingValue>) {
    if (!selected) return;
    updateSelected({
      bindings: {
        ...selected.bindings,
        [key]: { ...(selected.bindings?.[key] || { mode: "static", value: "" }), ...patch },
      },
    });
  }

  function addScene(type: SceneType) {
    const scene = newScene(type);
    setExperience((current) => ({ ...current, scenes: [...current.scenes, scene] }));
    setSelectedId(scene.id);
  }

  function moveScene(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const scenes = [...experience.scenes];
    const from = scenes.findIndex((scene) => scene.id === sourceId);
    const to = scenes.findIndex((scene) => scene.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = scenes.splice(from, 1);
    scenes.splice(to, 0, moved);
    setExperience({ ...experience, scenes });
  }

  function duplicateScene(id: string) {
    const index = experience.scenes.findIndex((scene) => scene.id === id);
    if (index < 0) return;
    const original = experience.scenes[index];
    const clone = { ...original, id: `${original.type}-${crypto.randomUUID()}`, name: `${original.name} Copy` };
    const scenes = [...experience.scenes];
    scenes.splice(index + 1, 0, clone);
    setExperience({ ...experience, scenes });
    setSelectedId(clone.id);
  }

  function removeScene(id: string) {
    setExperience((current) => ({ ...current, scenes: current.scenes.filter((scene) => scene.id !== id) }));
    if (selectedId === id) setSelectedId("");
  }

  async function save(status: "draft" | "published") {
    setSaving(true);
    setMessage("");
    const payload = {
      ...experience,
      status,
      version: status === "published" ? Number(experience.version || 0) + 1 : Number(experience.version || 0),
    };
    try {
      const response = await fetch("/api/bayan-experience-foundation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("save failed");
      setExperience(payload);
      setMessage(status === "published" ? "تم نشر Experience Foundation" : "تم حفظ المسودة");
    } catch {
      setMessage("تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}><span>ب</span><div><strong>BAYAN</strong><small>Experience Foundation 3.0</small></div></div>
        <div className={styles.project}><input value={experience.name} onChange={(e) => setExperience({ ...experience, name: e.target.value })}/><small>/parents</small></div>
        <div className={styles.actions}>
          <a href="/parents" target="_blank" rel="noreferrer">معاينة ↗</a>
          <button onClick={() => save("draft")} disabled={saving}>حفظ</button>
          <button className={styles.primary} onClick={() => save("published")} disabled={saving}>نشر</button>
        </div>
      </header>

      {message && <div className={styles.toast}>{message}</div>}

      <section className={styles.workspace}>
        <aside className={styles.library}>
          <span>SCENE LIBRARY</span>
          <h2>المشاهد</h2>
          <div className={styles.sceneGrid}>
            {sceneTypes.map((item) => (
              <button key={item.type} onClick={() => addScene(item.type)}><span>{item.icon}</span><strong>{item.label}</strong></button>
            ))}
          </div>
        </aside>

        <aside className={styles.layers}>
          <span>SCENE TREE</span>
          <h2>ترتيب التجربة</h2>
          <div className={styles.treeRoot}>▾ {experience.name}</div>
          {experience.scenes.map((scene, index) => (
            <article
              key={scene.id}
              draggable
              onDragStart={() => setDraggingId(scene.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggingId) moveScene(draggingId, scene.id);
                setDraggingId(null);
              }}
              className={selectedId === scene.id ? styles.activeScene : ""}
              onClick={() => setSelectedId(scene.id)}
            >
              <span className={styles.handle}>⋮⋮</span>
              <div><strong>{scene.name}</strong><small>{scene.type} · {index + 1}</small></div>
              <div className={styles.layerActions}>
                <button onClick={(event) => { event.stopPropagation(); updateSelected({ enabled: !scene.enabled }); }}>{scene.enabled ? "●" : "◌"}</button>
                <button onClick={(event) => { event.stopPropagation(); duplicateScene(scene.id); }}>⧉</button>
                <button onClick={(event) => { event.stopPropagation(); removeScene(scene.id); }}>×</button>
              </div>
            </article>
          ))}
        </aside>

        <section className={styles.canvas}>
          <div className={styles.canvasInner}>
            {experience.scenes.map((scene) => (
              <section key={scene.id} className={`${styles.scenePreview} ${selectedId === scene.id ? styles.selected : ""}`} onClick={() => setSelectedId(scene.id)}>
                <header><strong>{scene.name}</strong><small>{scene.type} · {scene.motion}</small></header>
                <div className={`${styles.previewBody} ${styles[scene.type]}`}>
                  <span>{scene.bindings?.title?.value || scene.name}</span>
                  <small>{scene.data?.collection || "No data source"}</small>
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className={styles.inspector}>
          <span>SCENE INSPECTOR</span>
          <h2>خصائص المشهد</h2>
          {selected ? (
            <div className={styles.fields}>
              <label><span>اسم المشهد</span><input value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })}/></label>
              <div className={styles.twoCols}>
                <label><span>نوع المشهد</span><select value={selected.type} onChange={(e) => updateSelected({ type: e.target.value as SceneType })}>{sceneTypes.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}</select></label>
                <label><span>الحركة</span><select value={selected.motion || "none"} onChange={(e) => updateSelected({ motion: e.target.value as MotionPreset })}><option value="none">None</option><option value="fade">Fade</option><option value="slide-up">Slide Up</option><option value="scale">Scale</option><option value="blur">Blur</option><option value="parallax">Parallax</option></select></label>
              </div>
              <label><span>Collection</span><input value={selected.data?.collection || ""} onChange={(e) => updateSelected({ data: { ...selected.data, collection: e.target.value } })}/></label>
              <div className={styles.twoCols}>
                <label><span>Limit</span><input type="number" value={selected.data?.limit || 6} onChange={(e) => updateSelected({ data: { ...selected.data, limit: Number(e.target.value) } })}/></label>
                <label><span>Order By</span><input value={selected.data?.orderBy || ""} onChange={(e) => updateSelected({ data: { ...selected.data, orderBy: e.target.value } })}/></label>
              </div>

              {(["title","subtitle","image","buttonLabel","buttonHref"] as const).map((key) => (
                <section className={styles.binding} key={key}>
                  <strong>{key}</strong>
                  <select value={selected.bindings?.[key]?.mode || "static"} onChange={(e) => updateBinding(key, { mode: e.target.value as "static" | "field" })}>
                    <option value="static">Static</option>
                    <option value="field">Data Field</option>
                  </select>
                  <input value={selected.bindings?.[key]?.value || ""} onChange={(e) => updateBinding(key, { value: e.target.value })}/>
                </section>
              ))}

              <div className={styles.twoCols}>
                <label><span>Variant</span><select value={selected.style?.variant || "default"} onChange={(e) => updateSelected({ style: { ...selected.style, variant: e.target.value as NonNullable<ExperienceScene["style"]>["variant"] } })}><option value="default">Default</option><option value="gradient">Gradient</option><option value="glass">Glass</option><option value="editorial">Editorial</option><option value="minimal">Minimal</option></select></label>
                <label><span>Min Height</span><input type="number" value={selected.style?.minHeight || 220} onChange={(e) => updateSelected({ style: { ...selected.style, minHeight: Number(e.target.value) } })}/></label>
              </div>

              <label className={styles.toggle}><input type="checkbox" checked={selected.enabled} onChange={(e) => updateSelected({ enabled: e.target.checked })}/><span>تفعيل المشهد</span></label>
            </div>
          ) : <div className={styles.empty}>اختر مشهدًا.</div>}
        </aside>
      </section>
    </main>
  );
}
