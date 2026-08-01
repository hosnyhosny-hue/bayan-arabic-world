"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./experience-foundation.module.css";
import type {
  BindingValue,
  ExperienceFoundationDocument,
  ExperienceScene,
} from "@/packages/bayan-experience-foundation/src";
import { defaultExperienceFoundation } from "@/packages/bayan-experience-foundation/src";

type DataItem = Record<string, unknown>;
type SceneDataMap = Record<string, DataItem[]>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function resolveBinding(binding: BindingValue | undefined, item: DataItem, fallback = "") {
  if (!binding) return fallback;
  if (binding.mode === "static") return binding.value || fallback;
  return text(item[binding.value], fallback);
}

async function fetchSceneData(scene: ExperienceScene): Promise<DataItem[]> {
  if (!scene.data?.collection) return [];

  const response = await fetch("/api/bayan-experience-foundation/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(scene.data),
  });

  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
}

export default function ExperienceFoundationRuntime() {
  const [experience, setExperience] = useState<ExperienceFoundationDocument>(defaultExperienceFoundation);
  const [sceneData, setSceneData] = useState<SceneDataMap>({});
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/bayan-experience-foundation?slug=parents&status=published",
          { cache: "no-store" }
        );

        let nextExperience = defaultExperienceFoundation;
        if (response.ok) {
          const payload = await response.json();
          if (payload.experience) nextExperience = payload.experience;
        }

        setExperience(nextExperience);

        const entries = await Promise.all(
          nextExperience.scenes
            .filter((scene) => scene.enabled)
            .map(async (scene) => [scene.id, await fetchSceneData(scene)] as const)
        );

        setSceneData(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const enabledScenes = useMemo(
    () => experience.scenes.filter((scene) => scene.enabled),
    [experience.scenes]
  );

  if (loading) {
    return <main className={styles.page}><div className={styles.empty}>جاري تجهيز تجربة بيان…</div></main>;
  }

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
        {enabledScenes.map((scene) => (
          <SceneRenderer
            key={scene.id}
            scene={scene}
            items={sceneData[scene.id] || []}
            activeChannel={activeChannel}
            onChannelChange={setActiveChannel}
          />
        ))}
      </div>
    </main>
  );
}

function SceneRenderer({
  scene,
  items,
  activeChannel,
  onChannelChange,
}: {
  scene: ExperienceScene;
  items: DataItem[];
  activeChannel: string;
  onChannelChange: (value: string) => void;
}) {
  const item = items[0] || {};
  const title = resolveBinding(scene.bindings?.title, item, scene.name);
  const subtitle = resolveBinding(scene.bindings?.subtitle, item, "");
  const image = resolveBinding(scene.bindings?.image, item, "");
  const buttonLabel = resolveBinding(scene.bindings?.buttonLabel, item, "");
  const buttonHref = resolveBinding(scene.bindings?.buttonHref, item, "#");

  if (scene.type === "hero") {
    return (
      <section className={styles.scene} data-motion={scene.motion || "none"}>
        <div
          className={styles.hero}
          style={{
            "--scene-height": `${scene.style?.minHeight || 420}px`,
            ...(image ? { backgroundImage: `linear-gradient(120deg,rgba(9,85,61,.92),rgba(239,139,39,.82)),url("${image}")` } : {}),
          } as React.CSSProperties}
        >
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>BAYAN FAMILY EXPERIENCE</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            {buttonLabel && <a href={buttonHref}>{buttonLabel}</a>}
          </div>
        </div>
      </section>
    );
  }

  if (scene.type === "channels") {
    return (
      <section className={styles.scene} data-motion={scene.motion || "none"}>
        <SectionHeader title={title} label="CHANNELS" />
        <div className={styles.channels}>
          {items.map((channel, index) => {
            const filter = text(channel.filter || channel.id, String(index));
            const active = activeChannel === filter;
            return (
              <button
                key={text(channel.id, String(index))}
                className={`${styles.channel} ${active ? styles.channelActive : ""}`}
                onClick={() => onChannelChange(active ? "" : filter)}
              >
                <span className={styles.channelIcon}>{text(channel.icon, "ب")}</span>
                <strong>{text(channel.title, "قناة")}</strong>
                <small>{text(channel.subtitle)}</small>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (scene.type === "stories") {
    return (
      <section className={styles.scene} data-motion={scene.motion || "none"}>
        <SectionHeader title={title} label="STORIES" />
        <div className={styles.stories}>
          {items.map((story, index) => (
            <article className={styles.story} key={text(story.id, String(index))}>
              <span className={styles.storyIcon}>{text(story.icon, "ب")}</span>
              <strong>{text(story.title, "قصة")}</strong>
              <small>{text(story.subtitle)}</small>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (scene.type === "feed") {
    const filtered = activeChannel
      ? items.filter((post) => {
          const category = text(post.category || post.type || post.channel).toLowerCase();
          const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
          return category.includes(activeChannel.toLowerCase()) || tags.includes(activeChannel);
        })
      : items;

    return (
      <section id="feed" className={styles.scene} data-motion={scene.motion || "none"}>
        <SectionHeader title={title} label="LIVE SCHOOL FEED" />
        <div className={styles.feed}>
          {filtered.length ? filtered.map((post, index) => (
            <article className={styles.post} key={text(post.id, String(index))}>
              <header className={styles.postHeader}>
                <span className={styles.avatar}>{text(post.authorName, "ب").slice(0, 1)}</span>
                <div>
                  <strong>{text(post.authorName, "فريق بيان")}</strong>
                  <small>{text(post.category || post.type, "تحديث")}</small>
                </div>
              </header>
              <h3>{text(post.title, "تحديث جديد")}</h3>
              <p>{text(post.content || post.body || post.caption, "تابع أحدث ما يحدث في مجتمع بيان.")}</p>
              {text(post.imageUrl || post.coverUrl) && (
                <div className={styles.postMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={text(post.imageUrl || post.coverUrl)} alt={text(post.title, "منشور بيان")} />
                </div>
              )}
              <footer className={styles.postFooter}>
                <span>♡ {Number(post.likesCount || 0)}</span>
                <span>◌ {Number(post.commentsCount || 0)}</span>
                <span>↗ مشاركة</span>
              </footer>
            </article>
          )) : <div className={styles.empty}>لا يوجد محتوى في هذه القناة بعد.</div>}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.scene} data-motion={scene.motion || "none"}>
      <SectionHeader title={title} label={scene.type.toUpperCase()} />
      <div className={styles.cards}>
        {items.length ? items.map((entry, index) => (
          <article className={styles.card} key={text(entry.id, String(index))}>
            <small>{text(entry.category || entry.type, scene.type)}</small>
            <h3>{text(entry.title, "عنصر جديد")}</h3>
            <p>{text(entry.subtitle || entry.description || entry.content)}</p>
          </article>
        )) : <div className={styles.empty}>لا توجد عناصر منشورة بعد.</div>}
      </div>
    </section>
  );
}

function SectionHeader({ title, label }: { title: string; label: string }) {
  return (
    <header className={styles.sectionHeader}>
      <div><span>{label}</span><h2>{title}</h2></div>
    </header>
  );
}
