"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProgressiveImage from "./ProgressiveImage";
import styles from "../pulse-main.module.css";
import living from "../pulse-living.module.css";

type HeroMode = {
  greeting: string;
  title: string;
  copy: string;
  image: string;
  label: string;
};

function getMode(hour: number): HeroMode {
  if (hour >= 5 && hour < 11) {
    return {
      greeting: "صباح الخير من بيان",
      title: "يوم جديد يبدأ بقصة تستحق أن تُروى.",
      copy: "تابعوا لحظات الصباح، أخبار الصفوف وأهم ما ينتظر مجتمع المدرسة اليوم.",
      image: "/images/bayan/pulse-hero-morning.jpg",
      label: "MORNING EDITION",
    };
  }
  if (hour >= 11 && hour < 16) {
    return {
      greeting: "منتصف اليوم في بيان",
      title: "المدرسة الآن في قلب الحدث.",
      copy: "أخبار، صور، فعاليات وإنجازات تتحدث مباشرة من قلب اليوم المدرسي.",
      image: "/images/bayan/pulse-hero-day.jpg",
      label: "LIVE SCHOOL DAY",
    };
  }
  if (hour >= 16 && hour < 20) {
    return {
      greeting: "مساء الإنجازات",
      title: "ملخص اليوم، كما عاشه مجتمع بيان.",
      copy: "اكتشفوا أجمل اللحظات والإنجازات والقصص التي صنعت يومنا.",
      image: "/images/bayan/pulse-hero-evening.jpg",
      label: "EVENING RECAP",
    };
  }
  return {
    greeting: "نبض بيان الليلي",
    title: "كل ما فاتكم اليوم، في تجربة واحدة.",
    copy: "راجعوا إصدار اليوم واستعدوا لما ينتظركم في صباح الغد.",
    image: "/images/bayan/pulse-hero-night.jpg",
    label: "NIGHT EDITION",
  };
}

export default function TimeAwareHero() {
  const [hour, setHour] = useState(12);

  useEffect(() => {
    const update = () => setHour(new Date().getHours());
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const mode = useMemo(() => getMode(hour), [hour]);

  return (
    <section className={`${styles.hero} ${living.timeAwareHero}`}>
      <ProgressiveImage src={mode.image} alt={mode.greeting} className={styles.heroImage} priority />
      <span className={styles.liveBadge}><i className={styles.liveDot}/> {mode.greeting}</span>
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>{mode.label}</span>
        <h1>{mode.title}</h1>
        <p>{mode.copy}</p>
        <div className={styles.heroActions}>
          <Link className={styles.heroPrimary} href="#today">اقرأ إصدار اليوم</Link>
          <Link className={styles.heroSecondary} href="/login">دخول العائلة</Link>
        </div>
      </div>
      <div className={living.heroClock}>
        <strong>{String(hour).padStart(2, "0")}:00</strong>
        <span>بتوقيت الدوحة</span>
      </div>
    </section>
  );
}
