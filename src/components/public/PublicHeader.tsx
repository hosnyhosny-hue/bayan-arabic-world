"use client";

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

const links = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/student", label: "الطلاب", icon: BookOpen },
  { href: "/parent", label: "أولياء الأمور", icon: Users },
  { href: "/newsletters", label: "النشرة الأسبوعية", icon: Newspaper },
  { href: "/achievements", label: "الإنجازات", icon: Trophy },
  { href: "/events", label: "الأنشطة", icon: CalendarDays },
];

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#0B6B49]/10 bg-white/90 backdrop-blur-xl">
      <div
        dir="rtl"
        className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4"
      >
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-b-4 border-[#D96E0D] bg-[#FF941F] text-xl font-black text-white">
            ب
          </span>

          <span className="leading-tight">
            <span className="block font-black text-[#0B6B49]">
              قسم اللغة العربية
            </span>
            <span className="block text-[10px] font-semibold text-[#728079]">
              King&apos;s College Doha
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#52615A] transition hover:bg-[#EEF8F2] hover:text-[#0B6B49]"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-xs font-bold text-[#0B6B49] hover:bg-[#EEF8F2]"
          >
            العربية | English
          </button>

          <Link
            href="/student"
            className="hidden items-center gap-2 rounded-xl border-b-4 border-[#075039] bg-[#0B6B49] px-4 py-2 text-xs font-black text-white sm:flex"
          >
            <LogIn size={17} />
            دخول الطالب
          </Link>

          <button
            type="button"
            aria-label="القائمة"
            className="rounded-xl p-2 text-[#0B6B49] xl:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
