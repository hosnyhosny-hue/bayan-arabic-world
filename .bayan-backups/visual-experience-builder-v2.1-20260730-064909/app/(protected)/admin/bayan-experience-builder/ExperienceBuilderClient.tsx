"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./experience-builder.module.css";
import {
  defaultFamilyExperience,
  type BayanBlock,
  type BayanBlockType,
  type BayanDevice,
  type BayanExperienceDocument,
  type BayanManualItem,
} from "@/packages/bayan-experience-builder/src";

const BLOCK_LIBRARY: Array<{ type: BayanBlockType; label: string; icon: string }> = [
  { type: "hero", label: "Hero", icon: "◫" },
  { type: "channels", label: "Channels", icon: "◎" },
  { type: "stories", label: "Stories", icon: "◉" },
  { type: "feed", label: "Feed", icon: "▤" },
  { type: "quickLinks", label: "Quick Links", icon: "↗" },
  { type: "events", label: "Events", icon: "▦" },
  { type: "achievements", label: "Achievements", icon: "★" },
  { type: "gallery", label: "Gallery", icon: "▧" },
  { type: "arabicBee", label: "Arabic Bee", icon: "ض" },
  { type: "stats", label: "Statistics", icon: "⌁" },
  { type: "cta", label: "CTA", icon: "→" },
  { type: "spacer", label: "Spacer", icon: "↕" },
];

function newBlock(type: BayanBlockType): BayanBlock {
  const label = BLOCK_LIBRARY.find((item) => item.type === type)?.label || type;
  const sourceMap: Partial<Record<BayanBlockType, string>> = {
    hero: "bayan_pulse_content",
    channels: "bayan_channels",
    stories: "bayan_pulse_stories",
    feed: "bayan_social_posts",
    quickLinks: "bayan_quick_links",
    events: "bayan_events",
    achievements: "bayan_achievements",
    gallery: "bayan_media",
  };

  return {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    title: label,
    subtitle: "",
    body: "",
    visible: true,
    variant: type === "hero" ? "gradient" : "default",
    align: "start",
    dataMode: "collection",
    source: sourceMap[type] || "",
    limit: 6,
    orderBy: type === "events" ? "startAt" : type === "channels" || type === "quickLinks" ? "order" : "publishedAt",
    orderDirection: type === "events" || type === "channels" || type === "quickLinks" ? "asc" : "desc",
    manualItems: [],
  };
}

export default function ExperienceBuilderClient() {
  const [experience, setExperience] = useState<BayanExperienceDocument>(defaultFamilyExperience);
  const [selectedId, setSelectedId] = useState(defaultFamilyExperience.blocks[0]?.id || "");
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

  function updateSelected(patch: Partial<BayanBlock>) {
    setExperience((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === selectedId ? { ...block, ...patch } : block),
    }));
  }

  function addBlock(type: BayanBlockType) {
    const block = newBlock(type);
    setExperience((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedId(block.id);
  }

  function addManualItem() {
    if (!selected) return;
    const item: BayanManualItem = {
      id: crypto.randomUUID(),
      title: "عنصر جديد",
      subtitle: "",
      icon: "ب",
      href: "",
      filter: "",
    };
    updateSelected({ manualItems: [...(selected.manualItems || []), item] });
  }

  function updateManualItem(id: string, patch: Partial<BayanManualItem>) {
    if (!selected) return;
    updateSelected({
      manualItems: (selected.manualItems || []).map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  }

  function removeManualItem(id: string) {
    if (!selected) return;
    updateSelected({ manualItems: (selected.manualItems || []).filter((item) => item.id !== id) });
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
      version: status === "published" ? Number(experience.version || 0) + 1 : Number(experience.version || 0),
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
      setMessage(status === "published" ? "تم نشر التجربة" : "تم حفظ المسودة");
    } catch {
      setMessage("تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function seedDynamicData() {
    setMessage("");
    try {
      const response = await fetch("/api/bayan-experience-builder/seed", {
        method: "POST",
        credentials: "include",
      });
      setMessage(response.ok ? "تم إنشاء البيانات الديناميكية الأولية" : "تعذر إنشاء البيانات");
    } catch {
      setMessage("تعذر إنشاء البيانات");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span>ب</span>
          <div><strong>BAYAN</strong><small>Visual Experience Builder 2.0</small></div>
        </div>
        <div className={styles.project}>
          <input value={experience.name} onChange={(e) => setExperience({ ...experience, name: e.target.value })}/>
          <small>/parents</small>
        </div>
        <div className={styles.topActions}>
          <div className={styles.devices}>
            {(["desktop","tablet","mobile"] as BayanDevice[]).map((item) => (
              <button key={item} className={device === item ? styles.activeDevice : ""} onClick={() => setDevice(item)}>{item}</button>
            ))}
          </div>
          <button onClick={seedDynamicData}>تهيئة البيانات</button>
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
                <span>{item.icon}</span><strong>{item.label}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.canvasArea}>
          <div className={`${styles.canvasFrame} ${styles[device]}`}>
            <div className={styles.canvas} style={{ background: experience.theme.background, gap: experience.theme.spacing, borderRadius: experience.theme.radius }}>
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
                    <span>::</span><strong>{BLOCK_LIBRARY.find((item) => item.type === block.type)?.label}</strong>
                    <small>{block.dataMode === "manual" ? `${block.manualItems?.length || 0} عناصر يدوية` : block.source || "بدون مصدر"}</small>
                  </div>
                  <div className={`${styles.blockPreview} ${styles[block.type]}`}>
                    <strong>{block.title || block.type}</strong>
                    <p>{block.dataMode === "manual" ? "محتوى يدوي ديناميكي" : `مصدر: ${block.source || "غير محدد"}`}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className={styles.inspector}>
          <div className={styles.panelHeader}><span>PROPERTIES</span><h2>خصائص العنصر</h2></div>
          {selected ? (
            <div className={styles.fields}>
              <label><span>العنوان</span><input value={selected.title || ""} onChange={(e) => updateSelected({ title: e.target.value })}/></label>
              <label><span>العنوان الفرعي</span><textarea value={selected.subtitle || ""} onChange={(e) => updateSelected({ subtitle: e.target.value })}/></label>

              <label><span>وضع البيانات</span>
                <select value={selected.dataMode || "collection"} onChange={(e) => updateSelected({ dataMode: e.target.value as BayanBlock["dataMode"] })}>
                  <option value="collection">Firestore Collection</option>
                  <option value="manual">Manual Items</option>
                  <option value="computed">Computed</option>
                </select>
              </label>

              {selected.dataMode !== "manual" ? (
                <>
                  <label><span>مصدر البيانات</span><input value={selected.source || ""} onChange={(e) => updateSelected({ source: e.target.value })}/></label>
                  <label><span>الترتيب حسب</span><input value={selected.orderBy || ""} onChange={(e) => updateSelected({ orderBy: e.target.value })}/></label>
                  <label><span>عدد العناصر</span><input type="number" min="1" max="50" value={selected.limit || 6} onChange={(e) => updateSelected({ limit: Number(e.target.value) })}/></label>
                </>
              ) : (
                <div className={styles.manualEditor}>
                  <div className={styles.manualHeader}><strong>العناصر اليدوية</strong><button onClick={addManualItem}>＋ إضافة</button></div>
                  {(selected.manualItems || []).map((item) => (
                    <article key={item.id}>
                      <input value={item.title} onChange={(e) => updateManualItem(item.id, { title: e.target.value })} placeholder="العنوان"/>
                      <input value={item.subtitle || ""} onChange={(e) => updateManualItem(item.id, { subtitle: e.target.value })} placeholder="العنوان الفرعي"/>
                      <input value={item.icon || ""} onChange={(e) => updateManualItem(item.id, { icon: e.target.value })} placeholder="الأيقونة"/>
                      <input value={item.href || ""} onChange={(e) => updateManualItem(item.id, { href: e.target.value })} placeholder="الرابط"/>
                      <input value={item.filter || ""} onChange={(e) => updateManualItem(item.id, { filter: e.target.value })} placeholder="فلتر القناة"/>
                      <button onClick={() => removeManualItem(item.id)}>حذف</button>
                    </article>
                  ))}
                </div>
              )}

              <label><span>نص الزر</span><input value={selected.buttonLabel || ""} onChange={(e) => updateSelected({ buttonLabel: e.target.value })}/></label>
              <label><span>رابط الزر</span><input value={selected.buttonHref || ""} onChange={(e) => updateSelected({ buttonHref: e.target.value })}/></label>
              <label className={styles.toggle}><input type="checkbox" checked={selected.visible !== false} onChange={(e) => updateSelected({ visible: e.target.checked })}/><span>إظهار العنصر</span></label>
            </div>
          ) : <div className={styles.emptyInspector}>اختر عنصرًا.</div>}
        </aside>
      </section>
    </main>
  );
}
