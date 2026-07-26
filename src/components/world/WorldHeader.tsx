"use client";

import Link from "next/link";
import { Languages, Volume2, VolumeX } from "lucide-react";
import { useWorld } from "@/src/context/WorldContext";

export default function WorldHeader() {
  const {
    isArabic,
    soundEnabled,
    toggleLanguage,
    toggleSound,
    playSound,
  } = useWorld();

  return (
    <header className="world-header">
      <Link
        href="/"
        className="brand"
        onMouseEnter={() => playSound("hover")}
        onClick={() => playSound("click")}
      >
        <span className="brand-logo">ب</span>

        <span>
          <strong>
            {isArabic ? "عالم بيان للعربية" : "Bayan Arabic World"}
          </strong>

          <small>
            {isArabic ? "BAYAN ARABIC WORLD" : "عالم بيان للعربية"}
          </small>
        </span>
      </Link>

      <div className="header-actions">
        <button
          type="button"
          className="header-button sound-button"
          onClick={toggleSound}
          aria-label={isArabic ? "تشغيل أو إيقاف الصوت" : "Toggle sound"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          type="button"
          className="header-button language-button"
          onClick={toggleLanguage}
          onMouseEnter={() => playSound("hover")}
        >
          <Languages size={17} />
          {isArabic ? "English" : "العربية"}
        </button>
      </div>
    </header>
  );
}
