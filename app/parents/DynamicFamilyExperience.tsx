"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BayanFamilyExperience from "./BayanFamilyExperience";
import styles from "./dynamic-family-experience.module.css";
import type {
  BayanBlock,
  BayanExperienceDocument,
  BayanManualItem,
} from "@/packages/bayan-experience-builder/src";

type DataItem = Record<string, unknown>;
type BlockData = Record<string, DataItem[]>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function fetchBlockData(block: BayanBlock): Promise<DataItem[]> {
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
      limit: block.limit,
      orderBy: block.orderBy,
      orderDirection: block.orderDirection,
      filters: block.filters,
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export default function DynamicFamilyExperience() {
  const [experience, setExperience] = useState<BayanExperienceDocument | null>(null);
  const [blockData, setBlockData] = useState<BlockData>({});
  const [loaded, setLoaded] = useState(false);
  const [activeChannel, setActiveChannel] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/bayan-experience-builder?slug=parents&status=published",
          { cache: "no-store" }
        );

        if (!response.ok) return;
        const payload = await response.json();
        const nextExperience = payload.experience as BayanExperienceDocument | null;

        if (!nextExperience) return;
        setExperience(nextExperience);

        const entries = await Promise.all(
          nextExperience.blocks
            .filter((block) => block.visible !== false)
            .map(async (block) => [block.id, await fetchBlockData(block)] as const)
        );

        setBlockData(Object.fromEntries(entries));
      } finally {
        setLoaded(true);
      }
    }

    load();
  }, []);

  if (!loaded) {
    return <main className={styles.loading}>جاري تحميل تجربة بيان…</main>;
  }

  if (!experience) {
    return <BayanFamilyExperience />;
  }

  const visibleBlocks = experience.blocks.filter((block) => block.visible !== false);

  return (
    <main
      className={styles.page}
      style={{
        "--primary": experience.theme.primary,
        "--secondary": experience.theme.secondary,
        "--background": experience.theme.background,
        "--surface": experience.theme.surface,
        "--text": experience.theme.text,
        "--muted": experience.theme.muted,
        "--radius": `${experience.theme.radius}px`,
        "--spacing": `${experience.theme.spacing}px`,
      } as React.CSSProperties}
    >
      <div className={styles.shell}>
        {visibleBlocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            items={blockData[block.id] || []}
            activeChannel={activeChannel}
            onChannelChange={setActiveChannel}
          />
        ))}
      </div>
    </main>
  );
}

function BlockRenderer({
  block,
  items,
  activeChannel,
  onChannelChange,
}: {
  block: BayanBlock;
  items: DataItem[];
  activeChannel: string;
  onChannelChange: (channel: string) => void;
}) {
  if (block.type === "hero") {
    const featured = items[0] || {};
    const title = text(featured.title, block.title || "BAYAN Family");
    const subtitle = text(
      featured.excerpt || featured.subtitle || featured.content,
      block.subtitle || ""
    );
    const imageUrl = text(featured.coverUrl || featured.imageUrl, block.imageUrl || "");

    return (
      <section
        className={styles.hero}
        style={imageUrl ? { backgroundImage: `linear-gradient(120deg,rgba(8,82,59,.93),rgba(239,139,39,.84)),url("${imageUrl}")` } : undefined}
      >
        <div>
          <span>BAYAN FAMILY</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {block.buttonLabel && <a href={block.buttonHref || "#"}>{block.buttonLabel}</a>}
        </div>
      </section>
    );
  }

  if (block.type === "channels") {
    return (
      <section>
        <SectionTitle title={block.title} />
        <div className={styles.channels}>
          {items.map((item, index) => {
            const filter = text(item.filter || item.id, String(index));
            const active = activeChannel === filter;
            return (
              <button
                key={text(item.id, String(index))}
                className={active ? styles.activeChannel : ""}
                onClick={() => onChannelChange(active ? "" : filter)}
              >
                <i>{text(item.icon, "ب")}</i>
                <strong>{text(item.title, "قناة")}</strong>
                <small>{text(item.subtitle)}</small>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (block.type === "stories") {
    return (
      <section>
        <SectionTitle title={block.title} />
        <div className={styles.stories}>
          {items.map((item, index) => (
            <article key={text(item.id, String(index))}>
              <i>{text(item.icon, "ب")}</i>
              <strong>{text(item.title, "قصة")}</strong>
              <small>{text(item.subtitle)}</small>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "feed") {
    const filtered = activeChannel
      ? items.filter((item) => {
          const category = text(item.category || item.type || item.channel).toLowerCase();
          const tags = Array.isArray(item.tags) ? item.tags.map(String) : [];
          return category.includes(activeChannel.toLowerCase()) || tags.includes(activeChannel);
        })
      : items;

    return (
      <section id="feed">
        <SectionTitle title={block.title} />
        <div className={styles.feed}>
          {filtered.length ? filtered.map((item, index) => (
            <article key={text(item.id, String(index))}>
              <header>
                <div className={styles.avatar}>{text(item.authorName, "ب").slice(0, 1)}</div>
                <div>
                  <strong>{text(item.authorName, "فريق بيان")}</strong>
                  <small>{text(item.category || item.type, "تحديث")}</small>
                </div>
              </header>
              <h3>{text(item.title, "تحديث جديد")}</h3>
              <p>{text(item.content || item.body || item.caption, "تابع أحدث ما يحدث في مجتمع بيان.")}</p>
              {text(item.imageUrl || item.coverUrl) && (
                <div className={styles.media}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={text(item.imageUrl || item.coverUrl)} alt={text(item.title, "منشور بيان")} />
                </div>
              )}
              <footer>
                <span>♡ {number(item.likesCount)}</span>
                <span>◌ {number(item.commentsCount)}</span>
                <span>↗ مشاركة</span>
              </footer>
            </article>
          )) : (
            <div className={styles.empty}>لا يوجد محتوى في هذه القناة بعد.</div>
          )}
        </div>
      </section>
    );
  }

  if (block.type === "quickLinks") {
    return (
      <section className={styles.panel}>
        <SectionTitle title={block.title} />
        <div className={styles.quickLinks}>
          {items.map((item, index) => (
            <Link key={text(item.id, String(index))} href={text(item.href, "#")}>
              <span>{text(item.icon, "↗")}</span>
              <strong>{text(item.title, "رابط")}</strong>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (["events", "achievements", "gallery", "arabicBee", "stats", "cta"].includes(block.type)) {
    return (
      <section className={styles.panel}>
        <SectionTitle title={block.title} />
        <div className={styles.cards}>
          {items.length ? items.map((item, index) => (
            <article key={text(item.id, String(index))}>
              <small>{text(item.category || item.type, block.type)}</small>
              <h3>{text(item.title, "عنصر جديد")}</h3>
              <p>{text(item.subtitle || item.description || item.content)}</p>
            </article>
          )) : <div className={styles.empty}>لا توجد عناصر منشورة بعد.</div>}
        </div>
      </section>
    );
  }

  return <div style={{ height: 60 }} />;
}

function SectionTitle({ title }: { title?: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2></header>;
}
