"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Home,
  LogIn,
  Menu,
  Newspaper,
  Trophy,
  Users,
} from "lucide-react";
import LanguageToggle from "../controls/LanguageToggle";
import SoundToggle from "../controls/SoundToggle";
import { useLanguage } from "../../context/LanguageContext";
import { useSound } from "../../context/SoundContext";

const navigation = [
  { href: "/", ar: "الرئيسية", en: "Home", icon: Home },
  { href: "/student", ar: "الطلاب", en: "Students", icon: BookOpen },
  { href: "/parent", ar: "أولياء الأمور", en: "Parents", icon: Users },
  {
    href: "/newsletters",
    ar: "النشرة الأسبوعية",
    en: "Weekly Newsletter",
    icon: Newspaper,
  },
  {
    href: "/achievements",
    ar: "الإنجازات",
    en: "Achievements",
    icon: Trophy,
  },
  { href: "/events", ar: "الأنشطة", en: "Activities", icon: CalendarDays },
];

export default function PublicHeader() {
  const { language, direction } = useLanguage();
  const { playClick } = useSound();

  return (
    <header className="sticky top-0 z-50 border-b border-[#0B6B49]/10 bg-white/92 backdrop-blur-xl">
      <div
        dir={direction}
        className="relative mx-auto flex min-h-[86px] max-w-[1500px] items-center justify-between px-4"
      >
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <SoundToggle />

          <Link
            href="/student"
            onClick={playClick}
            className="hidden items-center gap-2 rounded-xl border-b-4 border-[#075039] bg-[#0B6B49] px-4 py-2 text-xs font-black text-white sm:flex"
          >
            <LogIn size={17} />
            {language === "ar" ? "دخول الطالب" : "Student Login"}
          </Link>
        </div>

        <Link
          href="/"
          onClick={playClick}
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        >
          <Image
            src="/brand/kcd-logo.png"
            alt="King's College Doha"
            width={180}
            height={100}
            priority
            className="h-auto w-[125px] object-contain sm:w-[150px]"
          />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {navigation.map(({ href, ar, en, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={playClick}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#52615A] transition hover:-translate-y-0.5 hover:bg-[#EEF8F2] hover:text-[#0B6B49]"
            >
              <Icon size={17} />
              {language === "ar" ? ar : en}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Menu"
          className="rounded-xl p-2 text-[#0B6B49] xl:hidden"
        >
          <Menu size={23} />
        </button>
      </div>
    </header>
  );
}
