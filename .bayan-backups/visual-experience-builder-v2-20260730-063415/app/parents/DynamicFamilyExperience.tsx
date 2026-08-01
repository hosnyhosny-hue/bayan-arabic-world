"use client";

import { useEffect, useState } from "react";
import BayanFamilyExperience from "./BayanFamilyExperience";
import styles from "./dynamic-family-experience.module.css";
import type { BayanBlock, BayanExperienceDocument } from "@/packages/bayan-experience-builder/src";

type FeedItem = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export default function DynamicFamilyExperience() {
  const [experience, setExperience] = useState<BayanExperienceDocument | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [experienceResponse, feedResponse] = await Promise.all([
          fetch("/api/bayan-experience-builder?slug=parents&status=published", { cache: "no-store" }),
          fetch("/api/bayan-social/public-feed?limit=20", { cache: "no-store" }),
        ]);
        if (experienceResponse.ok) {
          const data = await experienceResponse.json();
          setExperience(data.experience || null);
        }
        if (feedResponse.ok) {
          const data = await feedResponse.json();
          setFeed(data.posts || []);
        }
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  if (!loaded) return <main className={styles.loading}>جاري تحميل تجربة بيان…</main>;
  if (!experience) return <BayanFamilyExperience />;

  return (
    <main
      className={styles.page}
      style={{
        "--primary": experience.theme.primary,
        "--secondary": experience.theme.secondary,
        "--background": experience.theme.background,
        "--radius": `${experience.theme.radius}px`,
        "--spacing": `${experience.theme.spacing}px`,
      } as React.CSSProperties}
    >
      <div className={styles.shell}>
        {experience.blocks.filter((block) => block.visible !== false).map((block) => (
          <BlockRenderer key={block.id} block={block} feed={feed} />
        ))}
      </div>
    </main>
  );
}

function BlockRenderer({ block, feed }: { block: BayanBlock; feed: FeedItem[] }) {
  if (block.type === "hero") {
    return <section className={styles.hero}><div><span>BAYAN FAMILY</span><h1>{block.title}</h1><p>{block.subtitle}</p>{block.buttonLabel && <a href={block.buttonHref || "#"}>{block.buttonLabel}</a>}</div></section>;
  }
  if (block.type === "stories") {
    return <section><header className={styles.sectionHeader}><h2>{block.title}</h2></header><div className={styles.stories}>{["Arabic Bee","الإنجازات","الفعاليات","الرحلات","القراءة"].slice(0, block.limit || 5).map((item) => <article key={item}><i>ب</i><strong>{item}</strong></article>)}</div></section>;
  }
  if (block.type === "feed") {
    return <section id="feed"><header className={styles.sectionHeader}><h2>{block.title}</h2></header><div className={styles.feed}>{feed.slice(0, block.limit || 12).map((item, index) => <article key={text(item.id, String(index))}><small>{text(item.authorName, "فريق بيان")}</small><h3>{text(item.title, "تحديث جديد")}</h3><p>{text(item.content || item.body || item.caption, "تابع أحدث ما يحدث في مجتمع بيان.")}</p></article>)}</div></section>;
  }
  if (["events","achievements","gallery","arabicBee","stats","cta"].includes(block.type)) {
    return <section className={styles.feature}><header className={styles.sectionHeader}><h2>{block.title}</h2></header><p>{block.subtitle || block.body || "محتوى ديناميكي يُدار من BAYAN Visual Experience Builder."}</p></section>;
  }
  return <div style={{ height: 60 }} />;
}
