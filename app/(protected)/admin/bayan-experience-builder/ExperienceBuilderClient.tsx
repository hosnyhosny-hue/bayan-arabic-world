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

type DataItem = Record<string, unknown>;
type DataPreviewMap = Record<string, DataItem[]>;

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

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function newBlock(type: BayanBlockType): BayanBlock {
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
    title: BLOCK_LIBRARY.find((item) => item.type === type)?.label || type,
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

async function fetchPreview(block: BayanBlock): Promise<DataItem[]> {
  if (block.dataMode === "manual") {
    return (block.manualItems || []) as unknown as DataItem[];
  }
  if (!block.source) return [];

  const response = await fetch("/api/bayan-experience-builder/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      source: block.source,
      limit: Math.min(block.limit || 6, 8),
      orderBy: block.orderBy,
      orderDirection: block.orderDirection,
      filters: block.filters,
    }),
  });

  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
}

export default function ExperienceBuilderClient() {
  const [experience, setExperience] = useState<BayanExperienceDocument>(defaultFamilyExperience);
  const [selectedId, setSelectedId] = useState(defaultFamilyExperience.blocks[0]?.id || "");
  const [device, setDevice] = useState<BayanDevice>("desktop");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<DataPreviewMap>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});
  const [layersOpen, setLayersOpen] = useState(true);

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

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const blocks = experience.blocks.filter((block) => block.visible !== false);
      const results = await Promise.all(
        blocks.map(async (block) => {
          setPreviewLoading((current) => ({ ...current, [block.id]: true }));
          try {
            return [block.id, await fetchPreview(block)] as const;
          } finally {
            setPreviewLoading((current) => ({ ...current, [block.id]: false }));
          }
        })
      );
      setPreview(Object.fromEntries(results));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [experience.blocks]);

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

  function updateBlock(id: string, patch: Partial<BayanBlock>) {
    setExperience((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === id ? { ...block, ...patch } : block),
    }));
  }

  function addBlock(type: BayanBlockType) {
    const block = newBlock(type);
    setExperience((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedId(block.id);
  }

  function duplicateBlock(id: string) {
    const index = experience.blocks.findIndex((block) => block.id === id);
    if (index < 0) return;
    const original = experience.blocks[index];
    const clone = {
      ...original,
      id: `${original.type}-${crypto.randomUUID()}`,
      title: `${original.title || original.type} نسخة`,
    };
    const blocks = [...experience.blocks];
    blocks.splice(index + 1, 0, clone);
    setExperience({ ...experience, blocks });
    setSelectedId(clone.id);
  }

  function removeBlock(id: string) {
    setExperience((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== id),
    }));
    if (selectedId === id) setSelectedId("");
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
    updateSelected({
      manualItems: (selected.manualItems || []).filter((item) => item.id !== id),
    });
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

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span>ب</span>
          <div><strong>BAYAN</strong><small>Visual Experience Builder 2.1</small></div>
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
          <button onClick={() => setLayersOpen((value) => !value)}>الطبقات</button>
          <a href="/parents" target="_blank" rel="noreferrer">معاينة ↗</a>
          <button className={styles.secondary} disabled={saving} onClick={() => save("draft")}>حفظ</button>
          <button className={styles.primary} disabled={saving} onClick={() => save("published")}>نشر</button>
        </div>
      </header>

      {message && <div className={styles.toast}>{message}</div>}

      <section className={`${styles.builder} ${layersOpen ? styles.withLayers : ""}`}>
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

        {layersOpen && (
          <aside className={styles.layers}>
            <div className={styles.panelHeader}><span>LAYERS</span><h2>هيكل الصفحة</h2></div>
            <div className={styles.layerTree}>
              <div className={styles.pageLayer}><span>▾</span><strong>{experience.name}</strong></div>
              {experience.blocks.map((block, index) => (
                <article
                  key={block.id}
                  draggable
                  onDragStart={() => setDraggingId(block.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) moveBlock(draggingId, block.id);
                    setDraggingId(null);
                  }}
                  className={`${styles.layerItem} ${selectedId === block.id ? styles.activeLayer : ""}`}
                  onClick={() => setSelectedId(block.id)}
                >
                  <span className={styles.dragHandle}>⋮⋮</span>
                  <div>
                    <strong>{block.title || block.type}</strong>
                    <small>{BLOCK_LIBRARY.find((item) => item.type === block.type)?.label} · {index + 1}</small>
                  </div>
                  <div className={styles.layerActions}>
                    <button
                      title={block.visible === false ? "إظهار" : "إخفاء"}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateBlock(block.id, { visible: block.visible === false });
                      }}
                    >
                      {block.visible === false ? "◌" : "●"}
                    </button>
                    <button
                      title="تكرار"
                      onClick={(event) => {
                        event.stopPropagation();
                        duplicateBlock(block.id);
                      }}
                    >
                      ⧉
                    </button>
                    <button
                      title="حذف"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeBlock(block.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        )}

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
                <section
                  key={block.id}
                  draggable
                  onDragStart={() => setDraggingId(block.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) moveBlock(draggingId, block.id);
                    setDraggingId(null);
                  }}
                  onClick={() => setSelectedId(block.id)}
                  className={`${styles.realBlock} ${selectedId === block.id ? styles.selectedBlock : ""} ${block.visible === false ? styles.hiddenBlock : ""}`}
                >
                  <div className={styles.blockChrome}>
                    <span>::</span>
                    <strong>{BLOCK_LIBRARY.find((item) => item.type === block.type)?.label}</strong>
                    <small>{previewLoading[block.id] ? "تحميل…" : `${preview[block.id]?.length || 0} عناصر`}</small>
                  </div>
                  <LiveBlock
                    block={block}
                    items={preview[block.id] || []}
                    onUpdate={(patch) => updateBlock(block.id, patch)}
                  />
                </section>
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

              <section className={styles.dataPreview}>
                <header>
                  <div><span>DATA PREVIEW</span><strong>{selected.source || "Manual Items"}</strong></div>
                  <small>{previewLoading[selected.id] ? "جارٍ التحميل" : `${preview[selected.id]?.length || 0} سجلات`}</small>
                </header>
                <div>
                  {(preview[selected.id] || []).slice(0, 5).map((item, index) => (
                    <article key={text(item.id, String(index))}>
                      <span>{text(item.icon, String(index + 1))}</span>
                      <div>
                        <strong>{text(item.title, text(item.name, "سجل بدون عنوان"))}</strong>
                        <small>{text(item.subtitle || item.category || item.type || item.status, "—")}</small>
                      </div>
                    </article>
                  ))}
                  {!previewLoading[selected.id] && !(preview[selected.id] || []).length && (
                    <div className={styles.emptyPreview}>لا توجد بيانات في هذا المصدر بعد.</div>
                  )}
                </div>
              </section>

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

function InlineText({
  value,
  onChange,
  as = "strong",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  as?: "strong" | "h2" | "h3" | "p";
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag
      className={className}
      contentEditable
      suppressContentEditableWarning
      onBlur={(event) => onChange(event.currentTarget.textContent || "")}
      onKeyDown={(event) => {
        if (event.key === "Enter" && as !== "p") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}

function LiveBlock({
  block,
  items,
  onUpdate,
}: {
  block: BayanBlock;
  items: DataItem[];
  onUpdate: (patch: Partial<BayanBlock>) => void;
}) {
  if (block.type === "hero") {
    const featured = items[0] || {};
    return (
      <div className={styles.liveHero}>
        <div>
          <span>BAYAN FAMILY</span>
          <InlineText
            as="h2"
            value={text(featured.title, block.title || "Hero")}
            onChange={(value) => onUpdate({ title: value })}
          />
          <InlineText
            as="p"
            value={text(featured.excerpt || featured.subtitle || featured.content, block.subtitle || "")}
            onChange={(value) => onUpdate({ subtitle: value })}
          />
          {block.buttonLabel && <button>{block.buttonLabel}</button>}
        </div>
      </div>
    );
  }

  if (block.type === "channels") {
    return (
      <div className={styles.liveSection}>
        <InlineText as="h3" value={block.title || "قنوات بيان"} onChange={(value) => onUpdate({ title: value })}/>
        <div className={styles.liveChannels}>
          {items.slice(0, block.limit || 6).map((item, index) => (
            <article key={text(item.id, String(index))}>
              <i>{text(item.icon, "ب")}</i>
              <strong>{text(item.title, "قناة")}</strong>
              <small>{text(item.subtitle)}</small>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "stories") {
    return (
      <div className={styles.liveSection}>
        <InlineText as="h3" value={block.title || "قصص بيان"} onChange={(value) => onUpdate({ title: value })}/>
        <div className={styles.liveStories}>
          {items.slice(0, block.limit || 6).map((item, index) => (
            <article key={text(item.id, String(index))}>
              <i>{text(item.icon, "ب")}</i>
              <strong>{text(item.title, "قصة")}</strong>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "feed") {
    return (
      <div className={styles.liveSection}>
        <InlineText as="h3" value={block.title || "نبض بيان"} onChange={(value) => onUpdate({ title: value })}/>
        <div className={styles.liveFeed}>
          {items.slice(0, 3).map((item, index) => (
            <article key={text(item.id, String(index))}>
              <header>
                <span>{text(item.authorName, "ب").slice(0, 1)}</span>
                <div><strong>{text(item.authorName, "فريق بيان")}</strong><small>{text(item.category || item.type, "تحديث")}</small></div>
              </header>
              <h4>{text(item.title, "منشور جديد")}</h4>
              <p>{text(item.content || item.body || item.caption, "محتوى المنشور سيظهر هنا.")}</p>
              <footer><span>♡ {number(item.likesCount)}</span><span>◌ {number(item.commentsCount)}</span></footer>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "quickLinks") {
    return (
      <div className={styles.liveSection}>
        <InlineText as="h3" value={block.title || "وصول سريع"} onChange={(value) => onUpdate({ title: value })}/>
        <div className={styles.liveQuickLinks}>
          {items.slice(0, block.limit || 6).map((item, index) => (
            <article key={text(item.id, String(index))}><span>{text(item.icon, "↗")}</span><strong>{text(item.title, "رابط")}</strong></article>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "gallery") {
    return (
      <div className={styles.liveSection}>
        <InlineText as="h3" value={block.title || "المعرض"} onChange={(value) => onUpdate({ title: value })}/>
        <div className={styles.liveGallery}>
          {items.slice(0, 6).map((item, index) => (
            <article key={text(item.id, String(index))}>
              {text(item.url || item.imageUrl || item.coverUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={text(item.url || item.imageUrl || item.coverUrl)} alt={text(item.title, "صورة")}/>
              ) : <span>{index + 1}</span>}
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "spacer") {
    return <div className={styles.liveSpacer}>Spacer</div>;
  }

  return (
    <div className={styles.liveSection}>
      <InlineText as="h3" value={block.title || block.type} onChange={(value) => onUpdate({ title: value })}/>
      <div className={styles.liveCards}>
        {items.slice(0, block.limit || 4).map((item, index) => (
          <article key={text(item.id, String(index))}>
            <small>{text(item.category || item.type, block.type)}</small>
            <strong>{text(item.title, "عنصر جديد")}</strong>
            <p>{text(item.subtitle || item.description || item.content)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
