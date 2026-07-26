"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useSound } from "../../context/SoundContext";

export default function SoundToggle() {
  const { language } = useLanguage();
  const { soundEnabled, toggleSound } = useSound();

  return (
    <button
      type="button"
      onClick={toggleSound}
      title={
        language === "ar"
          ? soundEnabled
            ? "إيقاف الصوت"
            : "تشغيل الصوت"
          : soundEnabled
            ? "Turn sound off"
            : "Turn sound on"
      }
      className="rounded-xl border border-[#0B6B49]/15 bg-white p-2.5 text-[#0B6B49] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#EEF8F2]"
    >
      {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
