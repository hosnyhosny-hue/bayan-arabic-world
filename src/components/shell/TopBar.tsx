"use client";

import { Bell, Flame, Gem, Menu, UserRound } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between rounded-[22px] border border-white/60 bg-white/90 px-4 shadow-[0_14px_40px_rgba(22,80,55,0.10)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl p-2 text-[#0B6B49] transition hover:bg-[#EEF8F2]"
          aria-label="القائمة"
        >
          <Menu size={22} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-b-4 border-[#D96E0D] bg-[#FF941F] text-xl font-black text-white shadow-md">
          ب
        </div>

        <div className="leading-tight">
          <p className="text-base font-black text-[#0B6B49]">عالم بيان</p>
          <p className="text-[10px] font-semibold text-[#728079]">
            BAYAN Arabic Learning World
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-1 font-black text-[#FF7A00] sm:flex">
          <Flame size={22} className="fill-[#FF941F] text-[#FF941F]" />
          <span>7</span>
        </div>

        <div className="hidden items-center gap-1 font-black text-[#6F55E8] sm:flex">
          <Gem size={21} />
          <span>340</span>
        </div>

        <div className="flex items-center gap-1 font-black text-[#0B6B49]">
          <span>740 XP</span>
        </div>

        <button
          type="button"
          aria-label="الإشعارات"
          className="relative rounded-xl p-2 text-[#0B6B49] transition hover:bg-[#EEF8F2]"
        >
          <Bell size={21} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FF7A00]" />
        </button>

        <button
          type="button"
          aria-label="الملف الشخصي"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B6B49] text-white"
        >
          <UserRound size={20} />
        </button>
      </div>
    </header>
  );
}
