"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./experience-foundation-studio.module.css";
import {
  defaultExperienceFoundation,
  type DeviceMode,
  type ExperienceFoundationDocument,
  type ExperienceScene,
  type SceneFrame,
  type SceneType,
} from "@/packages/bayan-experience-foundation/src";

const TYPES: Array<{ type: SceneType; label: string; icon: string; preview: string }> = [
  { type: "hero", label: "Hero", icon: "◫", preview: "عنوان وصورة رئيسية" },
  { type: "channels", label: "Channels", icon: "◎", preview: "قنوات دائرية" },
  { type: "stories", label: "Stories", icon: "◉", preview: "قصص قصيرة" },
  { type: "feed", label: "Feed", icon: "▤", preview: "أخبار ومنشورات" },
  { type: "events", label: "Events", icon: "▦", preview: "فعاليات قادمة" },
  { type: "achievements", label: "Achievements", icon: "★", preview: "لوحة شرف" },
  { type: "gallery", label: "Gallery", icon: "▧", preview: "شبكة صور" },
  { type: "arabicBee", label: "Arabic Bee", icon: "ض", preview: "تحديات وترتيب" },
  { type: "cta", label: "CTA", icon: "→", preview: "دعوة للإجراء" },
  { type: "custom", label: "Custom", icon: "+", preview: "مشهد مرن" },
];

const SIZES: Record<DeviceMode, { w: number; h: number }> = {
  desktop: { w: 1000, h: 1900 },
  tablet: { w: 760, h: 1700 },
  mobile: { w: 390, h: 1500 },
};

function frames(type: SceneType, index: number): Record<DeviceMode, SceneFrame> {
  const y = 30 + index * 250;
  const h = type === "hero" ? 340 : type === "feed" ? 460 : 210;
  return {
    desktop: { x: 40, y, w: 920, h },
    tablet: { x: 24, y, w: 712, h: Math.round(h * .86) },
    mobile: { x: 14, y, w: 362, h: Math.max(170, Math.round(h * .68)) },
  };
}

function normalize(doc: ExperienceFoundationDocument): ExperienceFoundationDocument {
  return { ...doc, scenes: doc.scenes.map((scene, index) => ({ ...scene, frames: scene.frames || frames(scene.type, index) })) };
}

function createScene(type: SceneType, index: number): ExperienceScene {
  const meta = TYPES.find((item) => item.type === type)!;
  return {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    name: meta.label,
    enabled: true,
    audience: "all",
    motion: type === "hero" ? "fade" : "slide-up",
    data: { limit: 6, orderDirection: "desc" },
    bindings: {
      title: { mode: "static", value: meta.label },
      subtitle: { mode: "static", value: meta.preview },
    },
    style: { variant: type === "hero" ? "gradient" : "editorial", align: "start" },
    frames: frames(type, index),
  };
}

export default function ExperienceFoundationStudio() {
  const [experience, setExperience] = useState(() => normalize(defaultExperienceFoundation));
  const [selectedId, setSelectedId] = useState(experience.scenes[0]?.id || "");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [history, setHistory] = useState<ExperienceFoundationDocument[]>([]);
  const [future, setFuture] = useState<ExperienceFoundationDocument[]>([]);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [resize, setResize] = useState<{ id: string; startX: number; startY: number; frame: SceneFrame } | null>(null);
  const [message, setMessage] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [collaborators, setCollaborators] = useState<Array<{ id: string; name?: string }>>([]);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    fetch("/api/bayan-experience-foundation?slug=parents", { credentials: "include", cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((payload) => {
        if (payload?.experience) {
          const next = normalize(payload.experience);
          setExperience(next);
          setSelectedId(next.scenes[0]?.id || "");
        }
      }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      await fetch("/api/bayan-experience-foundation/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId: experience.id,
          sessionId: sessionId.current,
          name: "محرر",
          selectedSceneId: selectedId,
        }),
      }).catch(() => undefined);
      const response = await fetch(`/api/bayan-experience-foundation/collaboration?experienceId=${encodeURIComponent(experience.id)}`, { cache: "no-store" }).catch(() => null);
      if (response?.ok) setCollaborators((await response.json()).collaborators || []);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [experience.id, selectedId]);

  const selected = useMemo(() => experience.scenes.find((scene) => scene.id === selectedId) || null, [experience.scenes, selectedId]);

  function commit(next: ExperienceFoundationDocument) {
    setHistory((items) => [...items.slice(-49), experience]);
    setFuture([]);
    setExperience(next);
  }

  function updateScene(id: string, patch: Partial<ExperienceScene>) {
    commit({ ...experience, scenes: experience.scenes.map((scene) => scene.id === id ? { ...scene, ...patch } : scene) });
  }

  function updateFrame(id: string, frame: SceneFrame) {
    const scene = experience.scenes.find((item) => item.id === id);
    if (!scene) return;
    updateScene(id, { frames: { ...(scene.frames || frames(scene.type, 0)), [device]: frame } });
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [experience, ...items]);
    setHistory((items) => items.slice(0, -1));
    setExperience(previous);
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, experience]);
    setFuture((items) => items.slice(1));
    setExperience(next);
  }

  async function generate() {
    if (!aiPrompt.trim()) return;
    const response = await fetch("/api/bayan-experience-foundation/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: aiPrompt }),
    });
    const payload = await response.json();
    if (Array.isArray(payload.scenes)) {
      commit({ ...experience, scenes: payload.scenes });
      setSelectedId(payload.scenes[0]?.id || "");
      setMessage("تم إنشاء التجربة من الوصف");
    }
  }

  async function save(status: "draft" | "published") {
    const payload = { ...experience, status, version: status === "published" ? experience.version + 1 : experience.version };
    const response = await fetch("/api/bayan-experience-foundation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;
    setExperience(payload);
    setMessage(status === "published" ? "تم النشر" : "تم الحفظ");
    await fetch("/api/bayan-experience-foundation/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceId: payload.id, label: status === "published" ? "نشر" : "حفظ", document: payload }),
    });
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}><span>ب</span><div><strong>BAYAN</strong><small>Experience Studio 4.0</small></div></div>
        <div className={styles.toolbar}>
          <button onClick={undo} disabled={!history.length}>↶</button>
          <button onClick={redo} disabled={!future.length}>↷</button>
          {(["desktop","tablet","mobile"] as DeviceMode[]).map((mode) => <button key={mode} className={device === mode ? styles.active : ""} onClick={() => setDevice(mode)}>{mode}</button>)}
        </div>
        <div className={styles.actions}>
          <div className={styles.presence}>{collaborators.slice(0,4).map((c) => <span key={c.id}>{(c.name || "م").slice(0,1)}</span>)}</div>
          <a href="/parents" target="_blank" rel="noreferrer">معاينة ↗</a>
          <button onClick={() => save("draft")}>حفظ</button>
          <button className={styles.primary} onClick={() => save("published")}>نشر</button>
        </div>
      </header>

      {message && <div className={styles.toast}>{message}</div>}

      <section className={styles.aiBar}>
        <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder='أنشئ صفحة ترحيب لأولياء الأمور مع Hero وأخبار المدرسة وقسم للفعاليات' />
        <button onClick={generate}>إنشاء بالذكاء الاصطناعي ✦</button>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.library}>
          <span>VISUAL COMPONENTS</span><h2>مكتبة المكونات</h2>
          <div className={styles.componentGrid}>
            {TYPES.map((item) => (
              <button key={item.type} onClick={() => {
                const scene = createScene(item.type, experience.scenes.length);
                commit({ ...experience, scenes: [...experience.scenes, scene] });
                setSelectedId(scene.id);
              }}>
                <div className={`${styles.miniPreview} ${styles[item.type]}`}><span>{item.icon}</span></div>
                <strong>{item.label}</strong><small>{item.preview}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.canvasArea}>
          <div className={styles.deviceLabel}>{device} · {SIZES[device].w}px</div>
          <div
            className={styles.canvas}
            style={{ width: SIZES[device].w, height: SIZES[device].h }}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              if (drag) {
                const scene = experience.scenes.find((item) => item.id === drag.id);
                const frame = scene?.frames?.[device];
                if (frame) updateFrame(drag.id, {
                  ...frame,
                  x: Math.max(0, Math.min(rect.width - frame.w, event.clientX - rect.left - drag.dx)),
                  y: Math.max(0, Math.min(rect.height - frame.h, event.clientY - rect.top - drag.dy)),
                });
              }
              if (resize) updateFrame(resize.id, {
                ...resize.frame,
                w: Math.max(180, resize.frame.w + event.clientX - resize.startX),
                h: Math.max(120, resize.frame.h + event.clientY - resize.startY),
              });
            }}
            onMouseUp={() => { setDrag(null); setResize(null); }}
            onMouseLeave={() => { setDrag(null); setResize(null); }}
          >
            {experience.scenes.filter((scene) => scene.enabled).map((scene) => {
              const frame = scene.frames?.[device] || frames(scene.type, 0)[device];
              return (
                <article
                  key={scene.id}
                  className={`${styles.scene} ${selectedId === scene.id ? styles.selected : ""}`}
                  style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
                  onMouseDown={(event) => {
                    if ((event.target as HTMLElement).dataset.resize) return;
                    const box = event.currentTarget.getBoundingClientRect();
                    setSelectedId(scene.id);
                    setDrag({ id: scene.id, dx: event.clientX - box.left, dy: event.clientY - box.top });
                  }}
                >
                  <div className={styles.sceneChrome}><span>⋮⋮</span><strong>{scene.name}</strong><small>{scene.motion}</small></div>
                  <div className={`${styles.sceneBody} ${styles[scene.type]}`}>
                    <h3 contentEditable suppressContentEditableWarning onBlur={(e) => updateScene(scene.id, { bindings: { ...scene.bindings, title: { mode: "static", value: e.currentTarget.textContent || "" } } })}>{scene.bindings?.title?.value || scene.name}</h3>
                    {scene.type === "feed" && <div className={styles.fakeFeed}><i/><i/><i/></div>}
                    {(scene.type === "channels" || scene.type === "stories") && <div className={styles.fakeCircles}><i/><i/><i/><i/></div>}
                    {scene.type === "gallery" && <div className={styles.fakeGallery}><i/><i/><i/><i/><i/><i/></div>}
                    {(scene.type === "events" || scene.type === "achievements") && <div className={styles.fakeCards}><i/><i/><i/></div>}
                  </div>
                  <button data-resize="true" className={styles.resizeHandle} onMouseDown={(event) => {
                    event.stopPropagation();
                    setResize({ id: scene.id, startX: event.clientX, startY: event.clientY, frame });
                  }}/>
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.inspector}>
          <span>INSPECTOR</span><h2>خصائص المشهد</h2>
          {selected ? <div className={styles.fields}>
            <label><span>اسم المشهد</span><input value={selected.name} onChange={(e) => updateScene(selected.id, { name: e.target.value })}/></label>
            <label><span>Collection</span><input value={selected.data?.collection || ""} onChange={(e) => updateScene(selected.id, { data: { ...selected.data, collection: e.target.value } })}/></label>
            <label><span>الحركة</span><select value={selected.motion || "none"} onChange={(e) => updateScene(selected.id, { motion: e.target.value as ExperienceScene["motion"] })}><option value="none">None</option><option value="fade">Fade</option><option value="slide-up">Slide Up</option><option value="scale">Scale</option><option value="blur">Blur</option><option value="parallax">Parallax</option></select></label>
            <label><span>العنوان</span><input value={selected.bindings?.title?.value || ""} onChange={(e) => updateScene(selected.id, { bindings: { ...selected.bindings, title: { mode: "static", value: e.target.value } } })}/></label>
            <div className={styles.frameGrid}>{(["x","y","w","h"] as const).map((key) => <label key={key}><span>{key.toUpperCase()}</span><input type="number" value={selected.frames?.[device]?.[key] || 0} onChange={(e) => updateFrame(selected.id, { ...(selected.frames?.[device] || frames(selected.type,0)[device]), [key]: Number(e.target.value) })}/></label>)}</div>
            <label className={styles.check}><input type="checkbox" checked={selected.enabled} onChange={(e) => updateScene(selected.id, { enabled: e.target.checked })}/><span>تفعيل المشهد</span></label>
          </div> : <div>اختر مشهدًا.</div>}
        </aside>
      </section>
    </main>
  );
}
