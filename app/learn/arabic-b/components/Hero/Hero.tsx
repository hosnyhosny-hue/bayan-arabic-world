"use client";

import styles from "../../arabic-b.module.css";

type HeroProps = {
  isArabic: boolean;
  openPlacement: () => void;
};

export default function Hero({
  isArabic,
  openPlacement,
}: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlowOne} />
      <div className={styles.heroGlowTwo} />

      <div className={styles.heroContent}>
        <div className={styles.eyebrow}>
          <span>CEFR A0–B2</span>
          <span>
            {isArabic ? "للطلاب غير العرب" : "For international learners"}
          </span>
        </div>

        <h1>
          {isArabic ? (
            <>
              تعلّم العربية
              <span> كما تُعاش.</span>
            </>
          ) : (
            <>
              Learn Arabic
              <span> for real life.</span>
            </>
          )}
        </h1>

        <p className={styles.heroLead}>
          {isArabic
            ? "رحلة تفاعلية تساعدك على فهم العربية والتحدث بها في المدرسة والحياة اليومية، خطوة بخطوة ومن مستواك الحقيقي."
            : "An interactive journey that helps you understand and speak Arabic at school and in daily life—step by step, from your real starting level."}
        </p>

        <div className={styles.heroButtons}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openPlacement}
          >
            <span>✦</span>
            {isArabic
              ? "ابدأ اختبار تحديد المستوى"
              : "Take the Placement Check"}
          </button>

          <a href="#journey" className={styles.secondaryButton}>
            {isArabic ? "استكشف رحلة التعلم" : "Explore the Learning Journey"}
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className={styles.heroTrust}>
          <span>✓ {isArabic ? "مواقف حقيقية" : "Real-life contexts"}</span>
          <span>✓ {isArabic ? "صوت وصورة" : "Sound and visuals"}</span>
          <span>✓ {isArabic ? "تعلّم متدرج" : "Levelled learning"}</span>
        </div>
      </div>

      <div className={styles.heroWorld} aria-hidden="true">
        <div className={styles.orbitLarge} />
        <div className={styles.orbitSmall} />

        <div className={styles.worldCore}>
          <span className={styles.worldArabic}>أهلًا</span>
          <span className={styles.worldEnglish}>Welcome</span>
        </div>

        <div className={`${styles.sceneCard} ${styles.sceneSchool}`}>
          <span>🏫</span>
          <strong>{isArabic ? "في المدرسة" : "At school"}</strong>
        </div>

        <div className={`${styles.sceneCard} ${styles.sceneCafe}`}>
          <span>🥪</span>
          <strong>{isArabic ? "في المقصف" : "At the canteen"}</strong>
        </div>

        <div className={`${styles.sceneCard} ${styles.sceneCity}`}>
          <span>📍</span>
          <strong>{isArabic ? "في الدوحة" : "Around Doha"}</strong>
        </div>

        <div className={styles.floatingWordOne}>
          {isArabic ? "مرحبًا" : "Hello"}
        </div>

        <div className={styles.floatingWordTwo}>
          {isArabic ? "شكرًا" : "Thank you"}
        </div>
      </div>
    </section>
  );
}
