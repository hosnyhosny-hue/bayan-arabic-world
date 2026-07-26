"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useSound } from "../../context/SoundContext";

export default function SoundToggle() {
  const { language } = useLanguage();
  const {
    soundEnabled,
    toggleSound,
    playHover,
  } = useSound();

  const label = soundEnabled
    ? language === "ar"
      ? "الصوت يعمل"
      : "Sound On"
    : language === "ar"
      ? "تشغيل الصوت"
      : "Enable Sound";

  return (
    <button
      type="button"
      onPointerEnter={playHover}
      onClick={toggleSound}
      title={label}
      aria-label={label}
      className={[
        "group flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold shadow-sm transition",
        "hover:-translate-y-0.5 hover:shadow-md",
        soundEnabled
          ? "border-[#FFB04A] bg-[#FFF1DB] text-[#E56D00]"
          : "border-[#0B6B49]/12 bg-white text-[#0B6B49]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-7 w-7 items-center justify-center rounded-xl transition group-hover:rotate-6",
          soundEnabled
            ? "bg-[#FF941F] text-white"
            : "bg-[#EAF8F0] text-[#0B6B49]",
        ].join(" ")}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </span>

      <span className="hidden sm:block">{label}</span>
    </button>
  );
}
