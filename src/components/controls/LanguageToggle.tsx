"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useSound } from "../../context/SoundContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const { playClick } = useSound();

  return (
    <button
      type="button"
      onClick={() => {
        playClick();
        toggleLanguage();
      }}
      className="flex items-center gap-2 rounded-xl border border-[#0B6B49]/15 bg-white px-3 py-2 text-xs font-black text-[#0B6B49] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#EEF8F2]"
    >
      <Languages size={17} />
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}
