"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./experience-builder.module.css";
import {
  defaultFamilyExperience,
  type BayanBlock,
  type BayanBlockType,
  type BayanDevice,
  type BayanExperienceDocument,
} from "@/packages/bayan-experience-builder/src";

const BLOCK_LIBRARY: Array<{ type: BayanBlockType; label: string; icon: string }> = [
  { type: "hero", label: "Hero", icon: "◫" },
  { type: "stories", label: "Stories", icon: "◉" },
  { type: "feed", label: "Feed", icon: "▤" },
  { type: "events", label: "Events", icon: "▦" },
  { type: "achievements", label: "Achievements", icon: "★" },
  { type: "gallery", label: "Gallery", icon: "▧" },
  { type: "arabicBee", label: "Arabic Bee", icon: "ض" },
  { type: "stats", label: "Statistics", icon: "⌁" },
  { type: "cta", label: "CTA", icon: "↗" },
  { type: "spacer", label: "Spacer", icon: "↕" },
];

function newBlock(type: BayanBlockType): BayanBlock {
  const label = BLOCK_LIBRARY.find((item) => item.type === type)?.label || type;
  return {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    title: label,
    subtitle: "",
    body: "",
    visible: true,
    variant: type === "hero" ? "gradient" : "default",
    align: "start",
    source:
      type === "feed"
        ? "bayan_social_posts"
        : type === "stories"
          ? "bayan_pulse_stories"
          : type === "events"
            ? "bayan_events"
            : type === "achievements"
              ? "bayan_achievements"
              : "",
    limit: 6,
  };
}

export default function ExperienceBuilderClient() {
  const [experience, setExperience] = useState<BayanExperienceDocument>(defaultFamilyExperience);
  const [selectedId, setSelectedId] = useState<string>(defaultFamilyExperience.blocks[0]?.id || "");
  const [device, setDevice] = useState<BayanDevice>("desktop");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/bayan-experience-builder?slug=parents", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.experience) {
          setExperience(data.experience);
          setSelectedId(data.experience.blocks?.[0]?.id || "");
        }
      } catch {}
    }
    load();
  }, []);

  const selected = useMemo(
    () => experience.blocks.find((block) => block.id === selectedId) || null,
    [experience.blocks, selectedId]
  );

  function addBlock(type: BayanBlockType) {
    const block = newBlock(type);
    setExperience((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedId(block.id);
  }

  function updateSelected(patch: Partial<BayanBlock>) {
    setExperience((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === selectedId ? { ...block, ...patch } : block),
    }));
  }

  function removeSelected() {
    setExperience((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== selectedId),
    }));
    setSelectedId("");
  }

  function duplicateSelected() {
    if (!selected) return;
    const clone = { ...selected, id: `${selected.type}-${crypto.randomUUID()}`, title: `${selected.title || ""} نسخة` };
    const index = experience.blocks.findIndex((block) => block.id === selected.id);
    const blocks = [...experience.blocks];
    blocks.splice(index + 1, 0, clone);
    setExperience({ ...experience, blocks });
    setSelectedId(clone.id);
  }

  function moveBlock(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const blocks = [...experience.blocks];
    const from = blocks.findIndex((block) => block.id === sourceId);
    const to = blocks.findIndex((block) => block.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    setExperience({ ...experience, blocks });
  }

  async function save(status: "draft" | "published") {
    setSaving(true);
    setMessage("");
    const payload = {
      ...experience,
      status,
      version: status === "published" ? experience.version + 1 : experience.version,
    };
    try {
      const response = await fetch("/api/bayan-experience-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("save failed");
      setExperience(payload);
      setMessage(status === "published" ? "تم نشر التجربة بنجاح" : "تم حفظ المسودة");
    } catch {
      setMessage("تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span>ب</span>
          <div><strong>BAYAN</strong><small>Visual Experience Builder</small></div>
        </div>
        <div className={styles.project}>
          <input
            value={experience.name}
            onChange={(e) => setExperience({ ...experience, name: e.target.value })}
            aria-label="اسم التجربة"
          />
          <small>/parents</small>
        </div>
        <div className={styles.topActions}>
          <div className={styles.devices}>
            {(["desktop","tablet","mobile"] as BayanDevice[]).map((item) => (
              <button key={item} className={device === item ? styles.activeDevice : ""} onClick={() => setDevice(item)}>
                {item === "desktop" ? "Desktop" : item === "tablet" ? "Tablet" : "Mobile"}
              </button>
            ))}
          </div>
          <a href="/parents" target="_blank" rel="noreferrer">معاينة ↗</a>
          <button className={styles.secondary} disabled={saving} onClick={() => save("draft")}>حفظ</button>
          <button className={styles.primary} disabled={saving} onClick={() => save("published")}>نشر</button>
        </div>
      </header>

      {message && <div className={styles.toast}>{message}</div>}

      <section className={styles.builder}>
        <aside className={styles.library}>
          <div className={styles.panelHeader}><span>COMPONENTS</span><h2>مكتبة المكونات</h2></div>
          <div className={styles.libraryGrid}>
            {BLOCK_LIBRARY.map((item) => (
              <button key={item.type} onClick={() => addBlock(item.type)}>
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>
          <div className={styles.templates}>
            <span>TEMPLATES</span>
            <button onClick={() => setExperience(defaultFamilyExperience)}>Family Pulse</button>
            <button onClick={() => setExperience({
              ...defaultFamilyExperience,
              id: "arabic-bee-page",
              name: "Arabic Bee Experience",
              slug: "arabic-bee",
              blocks: [
                newBlock("hero"),
                newBlock("stats"),
                newBlock("arabicBee"),
                newBlock("achievements"),
                newBlock("cta"),
              ],
            })}>Arabic Bee</button>
          </div>
        </aside>

        <section className={styles.canvasArea}>
          <div className={`${styles.canvasFrame} ${styles[device]}`}>
            <div
              className={styles.canvas}
              style={{
                background: experience.theme.background,
                gap: experience.theme.spacing,
                borderRadius: experience.theme.radius,
              }}
            >
              {experience.blocks.map((block) => (
                <button
                  key={block.id}
                  draggable
                  onDragStart={() => setDraggingId(block.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggingId) moveBlock(draggingId, block.id);
                    setDraggingId(null);
                  }}
                  onClick={() => setSelectedId(block.id)}
                  className={`${styles.block} ${selectedId === block.id ? styles.selectedBlock : ""}`}
                >
                  <div className={styles.blockToolbar}>
                    <span>::</span>
                    <strong>{BLOCK_LIBRARY.find((item) => item.type === block.type)?.label}</strong>
                    <small>{block.visible === false ? "مخفي" : "ظاهر"}</small>
                  </div>
                  <div className={`${styles.blockPreview} ${styles[block.type]}`}>
                    <strong>{block.title || block.type}</strong>
                    {block.subtitle && <p>{block.subtitle}</p>}
                    {block.body && <p>{block.body}</p>}
                    {block.type === "stories" && <div className={styles.fakeStories}><i/><i/><i/><i/><i/></div>}
                    {block.type === "feed" && <div className={styles.fakeFeed}><i/><i/><i/></div>}
                    {block.type === "gallery" && <div className={styles.fakeGallery}><i/><i/><i/><i/></div>}
                  </div>
                </button>
              ))}
              {!experience.blocks.length && <div className={styles.emptyCanvas}>اسحب أو أضف مكونًا للبدء.</div>}
            </div>
          </div>
        </section>

        <aside className={styles.inspector}>
          <div className={styles.panelHeader}><span>PROPERTIES</span><h2>خصائص العنصر</h2></div>
          {selected ? (
            <div className={styles.fields}>
              <label><span>العنوان</span><input value={selected.title || ""} onChange={(e) => updateSelected({ title: e.target.value })}/></label>
              <label><span>العنوان الفرعي</span><textarea value={selected.subtitle || ""} onChange={(e) => updateSelected({ subtitle: e.target.value })}/></label>
              <label><span>النص</span><textarea value={selected.body || ""} onChange={(e) => updateSelected({ body: e.target.value })}/></label>
              <div className={styles.twoCols}>
                <label><span>النوع البصري</span><select value={selected.variant || "default"} onChange={(e) => updateSelected({ variant: e.target.value as BayanBlock["variant"] })}><option value="default">Default</option><option value="gradient">Gradient</option><option value="glass">Glass</option><option value="minimal">Minimal</option></select></label>
                <label><span>المحاذاة</span><select value={selected.align || "start"} onChange={(e) => updateSelected({ align: e.target.value as BayanBlock["align"] })}><option value="start">Start</option><option value="center">Center</option></select></label>
              </div>
              <label><span>مصدر البيانات</span><input value={selected.source || ""} onChange={(e) => updateSelected({ source: e.target.value })}/></label>
              <label><span>عدد العناصر</span><input type="number" min="1" max="50" value={selected.limit || 6} onChange={(e) => updateSelected({ limit: Number(e.target.value) })}/></label>
              <label><span>رابط الصورة</span><input value={selected.imageUrl || ""} onChange={(e) => updateSelected({ imageUrl: e.target.value })}/></label>
              <label><span>نص الزر</span><input value={selected.buttonLabel || ""} onChange={(e) => updateSelected({ buttonLabel: e.target.value })}/></label>
              <label><span>رابط الزر</span><input value={selected.buttonHref || ""} onChange={(e) => updateSelected({ buttonHref: e.target.value })}/></label>
              <label className={styles.toggle}><input type="checkbox" checked={selected.visible !== false} onChange={(e) => updateSelected({ visible: e.target.checked })}/><span>إظهار العنصر</span></label>
              <div className={styles.inspectorActions}>
                <button onClick={duplicateSelected}>تكرار</button>
                <button className={styles.danger} onClick={removeSelected}>حذف</button>
              </div>
            </div>
          ) : <div className={styles.emptyInspector}>اختر عنصرًا من مساحة العمل.</div>}

          <div className={styles.themePanel}>
            <span>THEME</span>
            <label><span>Primary</span><input type="color" value={experience.theme.primary} onChange={(e) => setExperience({ ...experience, theme: { ...experience.theme, primary: e.target.value } })}/></label>
            <label><span>Secondary</span><input type="color" value={experience.theme.secondary} onChange={(e) => setExperience({ ...experience, theme: { ...experience.theme, secondary: e.target.value } })}/></label>
            <label><span>Background</span><input type="color" value={experience.theme.background} onChange={(e) => setExperience({ ...experience, theme: { ...experience.theme, background: e.target.value } })}/></label>
          </div>
        </aside>
      </section>
    </main>
  );
}
