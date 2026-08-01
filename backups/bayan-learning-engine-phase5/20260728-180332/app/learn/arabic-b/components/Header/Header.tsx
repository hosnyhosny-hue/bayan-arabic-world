"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

type HeaderProps = {
  isArabic: boolean;
  onToggleLanguage: () => void;
};

export default function Header({
  isArabic,
  onToggleLanguage,
}: HeaderProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;

      const scrollableHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const progress =
        scrollableHeight > 0
          ? Math.min((scrollTop / scrollableHeight) * 100, 100)
          : 0;

      setIsCompact(scrollTop > 32);
      setScrollProgress(progress);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
      passive: true,
    });

    window.addEventListener("resize", updateHeader);

    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  useEffect(() => {
    const closeMenu = () => setMobileOpen(false);

    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("resize", closeMenu);
    };
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header
      className={`${styles.header} ${
        isCompact ? styles.compact : ""
      }`}
    >
      <div
        className={styles.progressTrack}
        aria-hidden="true"
      >
        <span
          className={styles.progressBar}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className={styles.headerInner}>
        <Link
          href="/"
          className={styles.brand}
          aria-label={isArabic ? "الرئيسية" : "BAYAN home"}
          onClick={closeMobileMenu}
        >
          <span className={styles.brandMark}>ب</span>

          <span className={styles.brandText}>
            <strong>BAYAN Arabic</strong>
            <small>
              {isArabic
                ? "العربية للعالم"
                : "Arabic for the World"}
            </small>
          </span>
        </Link>

        <nav
          className={styles.desktopNav}
          aria-label={
            isArabic
              ? "التنقل في تجربة بيان"
              : "BAYAN Arabic navigation"
          }
        >
          <a href="#journey">
            <span aria-hidden="true">🧭</span>
            {isArabic ? "الرحلة" : "Journey"}
          </a>

          <a href="#mission">
            <span aria-hidden="true">⚡</span>
            {isArabic ? "مهمة اليوم" : "Mission"}
          </a>

          <a href="#skills">
            <span aria-hidden="true">✦</span>
            {isArabic ? "المهارات" : "Skills"}
          </a>

          <a
            href="#speak"
            className={styles.speakNavLink}
          >
            <span
              className={styles.speakPulse}
              aria-hidden="true"
            />
            {isArabic ? "تحدث" : "Speak"}
          </a>
        </nav>

        <div className={styles.desktopStatus}>
          <div
            className={styles.metric}
            title={isArabic ? "سلسلة التعلم" : "Learning streak"}
          >
            <span className={styles.metricIcon}>🔥</span>
            <span>
              <strong>12</strong>
              <small>{isArabic ? "يومًا" : "days"}</small>
            </span>
          </div>

          <div
            className={styles.metric}
            title={isArabic ? "نقاط الخبرة" : "Experience points"}
          >
            <span className={styles.metricIcon}>⭐</span>
            <span>
              <strong>860</strong>
              <small>XP</small>
            </span>
          </div>

          <span className={styles.rankBadge}>
            <span aria-hidden="true">🏅</span>
            {isArabic ? "مستكشف" : "Explorer"}
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.languageButton}
            onClick={onToggleLanguage}
            aria-label={
              isArabic
                ? "Switch to English"
                : "التبديل إلى العربية"
            }
          >
            <span aria-hidden="true">🌐</span>
            <span>{isArabic ? "EN" : "AR"}</span>
          </button>

          <Link
            href="/"
            className={styles.homeButton}
          >
            <span aria-hidden="true">⌂</span>
            <span>
              {isArabic ? "الرئيسية" : "Home"}
            </span>
          </Link>

          <button
            type="button"
            className={`${styles.menuButton} ${
              mobileOpen ? styles.menuButtonOpen : ""
            }`}
            onClick={() =>
              setMobileOpen((current) => !current)
            }
            aria-expanded={mobileOpen}
            aria-controls="bayan-mobile-navigation"
            aria-label={
              mobileOpen
                ? isArabic
                  ? "إغلاق القائمة"
                  : "Close menu"
                : isArabic
                  ? "فتح القائمة"
                  : "Open menu"
            }
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="bayan-mobile-navigation"
        className={`${styles.mobilePanel} ${
          mobileOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        <div className={styles.mobileMetrics}>
          <div>
            <span aria-hidden="true">🔥</span>
            <strong>12</strong>
            <small>
              {isArabic ? "يومًا متتاليًا" : "day streak"}
            </small>
          </div>

          <div>
            <span aria-hidden="true">⭐</span>
            <strong>860</strong>
            <small>XP</small>
          </div>

          <div>
            <span aria-hidden="true">🏅</span>
            <strong>
              {isArabic ? "مستكشف" : "Explorer"}
            </strong>
            <small>
              {isArabic ? "رتبتي" : "My rank"}
            </small>
          </div>
        </div>

        <nav className={styles.mobileNav}>
          <a href="#journey" onClick={closeMobileMenu}>
            <span aria-hidden="true">🧭</span>
            <span>
              <strong>
                {isArabic ? "رحلتي" : "My Journey"}
              </strong>
              <small>
                {isArabic
                  ? "تابع تقدمك في المستويات"
                  : "Continue your learning path"}
              </small>
            </span>
          </a>

          <a href="#mission" onClick={closeMobileMenu}>
            <span aria-hidden="true">⚡</span>
            <span>
              <strong>
                {isArabic ? "مهمة اليوم" : "Daily Mission"}
              </strong>
              <small>
                {isArabic
                  ? "أكمل تحديك اليومي"
                  : "Complete today's challenge"}
              </small>
            </span>
          </a>

          <a href="#skills" onClick={closeMobileMenu}>
            <span aria-hidden="true">✦</span>
            <span>
              <strong>
                {isArabic ? "المهارات" : "Skills"}
              </strong>
              <small>
                {isArabic
                  ? "الاستماع والتحدث والقراءة والكتابة"
                  : "Listening, speaking, reading and writing"}
              </small>
            </span>
          </a>

          <a
            href="#speak"
            className={styles.mobileSpeak}
            onClick={closeMobileMenu}
          >
            <span aria-hidden="true">🎙️</span>
            <span>
              <strong>
                {isArabic
                  ? "تحدث بالعربية"
                  : "Speak Arabic"}
              </strong>
              <small>
                {isArabic
                  ? "ابدأ محادثة ذكية"
                  : "Start an AI conversation"}
              </small>
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
