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
    ar: "النشرة",
    en: "Newsletter",
    icon: Newspaper,
  },
  {
    href: "/achievements",
    ar: "الإنجازات",
    en: "Achievements",
    icon: Trophy,
  },
  {
    href: "/events",
    ar: "الأنشطة",
    en: "Activities",
    icon: CalendarDays,
  },
];

export default function PublicHeader() {
  const { language, direction } = useLanguage();
  const { playClick, playHover } = useSound();

  return (
    <header className="sticky top-0 z-50 border-b border-[#0B6B49]/8 bg-white/90 backdrop-blur-2xl">
      <div
        dir={direction}
        className="relative mx-auto flex min-h-[92px] max-w-[1500px] items-center justify-between px-4"
      >
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <SoundToggle />

          <Link
            href="/student"
            onPointerEnter={playHover}
            onClick={playClick}
            className="hidden items-center gap-2 rounded-2xl border-b-4 border-[#075039] bg-[#0B6B49] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 sm:flex"
          >
            <LogIn size={17} />
            {language === "ar" ? "دخول الطالب" : "Student Login"}
          </Link>
        </div>

        <Link
          href="/"
          onPointerEnter={playHover}
          onClick={playClick}
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-[0_8px_30px_rgba(11,107,73,0.10)]"
        >
          <Image
            src="/brand/kcd-logo.png"
            alt="King's College Doha"
            width={156}
            height={92}
            priority
            className="h-[54px] w-auto object-contain sm:h-[63px]"
          />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {navigation.map(({ href, ar, en, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onPointerEnter={playHover}
              onClick={playClick}
              className="group flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-semibold text-[#52615A] transition hover:-translate-y-0.5 hover:bg-[#EAF8F0] hover:text-[#0B6B49]"
            >
              <Icon
                size={17}
                className="transition group-hover:rotate-6 group-hover:scale-110"
              />
              {language === "ar" ? ar : en}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Menu"
          className="rounded-2xl bg-[#EAF8F0] p-3 text-[#0B6B49] xl:hidden"
        >
          <Menu size={23} />
        </button>
      </div>
    </header>
  );
}
