"use client";

import { useEffect, useState } from "react";
import ProgressiveImage from "./ProgressiveImage";
import styles from "../pulse-main.module.css";
import living from "../pulse-living.module.css";

type Story = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  isLive?: boolean;
};

const fallback: Story[] = [
  { id: "1", title: "صباح بيان", subtitle: "منذ 12 دقيقة", image: "/images/bayan/pulse-story-1.jpg", isLive: true },
  { id: "2", title: "داخل الصف", subtitle: "جديد", image: "/images/bayan/pulse-story-2.jpg" },
  { id: "3", title: "Arabic Bee", subtitle: "اليوم", image: "/images/bayan/pulse-story-3.jpg" },
  { id: "4", title: "إنجازات", subtitle: "6 قصص", image: "/images/bayan/pulse-story-4.jpg" },
  { id: "5", title: "الفعاليات", subtitle: "هذا الأسبوع", image: "/images/bayan/pulse-story-5.jpg" },
  { id: "6", title: "مجتمع بيان", subtitle: "جديد", image: "/images/bayan/pulse-story-6.jpg" },
];

export default function LiveStories() {
  const [stories, setStories] = useState(fallback);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/pulse/stories", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (active && Array.isArray(payload.items) && payload.items.length) {
          setStories(payload.items);
          setUpdated(true);
          window.setTimeout(() => setUpdated(false), 1400);
        }
      } catch {}
    }

    refresh();
    const timer = window.setInterval(refresh, 20000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={`${styles.stories} ${updated ? living.storiesUpdated : ""}`}>
      {stories.map((story) => (
        <button className={styles.story} key={story.id}>
          <span className={`${styles.storyRing} ${story.isLive ? living.liveStoryRing : ""}`}>
            <ProgressiveImage src={story.image} alt={story.title}/>
            {story.isLive && <i className={living.storyLiveBadge}>LIVE</i>}
          </span>
          <strong>{story.title}</strong>
          <small>{story.subtitle}</small>
        </button>
      ))}
    </div>
  );
}
