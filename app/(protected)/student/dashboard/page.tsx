"use client";

import {
  BookOpenCheck,
  CalendarCheck,
  ChevronLeft,
  Flame,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import TopBar from "@/src/components/shell/TopBar";
import LearningNode from "@/src/components/learning/LearningNode";
import { learningPath } from "@/src/data/learning-path";

export default function Home() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,#EAF8F0_0%,#FFF9EF_44%,#F7EEDC_100%)] text-[#22312A]"
    >
      <div className="mx-auto min-h-screen max-w-[1500px] px-3 py-3 sm:px-5 lg:px-7">
        <TopBar />

        <div className="mt-4 grid gap-4 lg:grid-cols-[245px_minmax(0,1fr)_300px]">
          <aside className="hidden lg:block">
            <div className="sticky top-4 space-y-3 rounded-[28px] border border-white/70 bg-white/85 p-3 shadow-[0_16px_45px_rgba(22,80,55,0.10)] backdrop-blur-xl">
              {[
                ["مسار التعلم", BookOpenCheck, true],
                ["مهمة اليوم", CalendarCheck, false],
                ["الإنجازات", Medal, false],
                ["التحديات", Trophy, false],
                ["المجلة الرقمية", Sparkles, false],
              ].map(([label, Icon, active]) => {
                const ItemIcon = Icon as typeof BookOpenCheck;

                return (
                  <button
                    key={label as string}
                    type="button"
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right text-sm font-black transition",
                      active
                        ? "border-b-4 border-[#0A5A3D] bg-[#19A96F] text-white"
                        : "text-[#56645D] hover:bg-[#EEF8F2] hover:text-[#0B6B49]",
                    ].join(" ")}
                  >
                    <ItemIcon size={21} />
                    <span>{label as string}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-l from-[#0B6B49] via-[#128157] to-[#23AD74] p-6 text-white shadow-[0_20px_60px_rgba(11,107,73,0.20)]">
              <div className="absolute -left-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 right-1/3 h-40 w-40 rounded-full bg-[#FF941F]/20" />

              <div className="relative z-10 flex items-center justify-between gap-5">
                <div>
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-black">
                    المستوى الرابع
                  </span>

                  <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    واصل رحلتك في العربية
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-white/80">
                    أكمل نشاط مفردات المدرسة، واجمع النجوم، وحافظ على سلسلة
                    تعلمك اليومية.
                  </p>

                  <button
                    type="button"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl border-b-4 border-[#D96E0D] bg-[#FF941F] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-1"
                  >
                    متابعة الدرس
                    <ChevronLeft size={18} />
                  </button>
                </div>

                <div className="hidden h-40 w-40 shrink-0 items-center justify-center rounded-full border-8 border-white/15 bg-white/10 md:flex">
                  <div className="text-center">
                    <p className="text-4xl font-black">68%</p>
                    <p className="text-xs text-white/75">تقدم الوحدة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[32px] border border-white/70 bg-white/80 px-4 py-8 shadow-[0_16px_45px_rgba(22,80,55,0.10)] backdrop-blur-xl sm:px-8">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#FF7A00]">
                    الوحدة الأولى
                  </p>
                  <h2 className="text-2xl font-black text-[#0B6B49]">
                    لغتي وعالمي
                  </h2>
                </div>

                <span className="rounded-full bg-[#EEF8F2] px-4 py-2 text-xs font-black text-[#0B6B49]">
                  2 من 6 مكتملة
                </span>
              </div>

              <div className="relative mx-auto flex max-w-xl flex-col items-center gap-10 py-4">
                <div className="absolute bottom-16 top-16 w-2 rounded-full bg-[#DCE9E1]" />

                {learningPath.map((node, index) => (
                  <div key={node.id} className="relative z-10">
                    <LearningNode {...node} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_45px_rgba(22,80,55,0.10)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DF] text-[#FF7A00]">
                  <Flame size={27} className="fill-[#FF941F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#728079]">
                    سلسلة التعلم
                  </p>
                  <p className="text-xl font-black text-[#22312A]">7 أيام</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-1">
                {["س", "ح", "ن", "ث", "ر", "خ", "ج"].map((day, index) => (
                  <div key={day} className="text-center">
                    <div
                      className={[
                        "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black",
                        index < 6
                          ? "bg-[#FF941F] text-white"
                          : "bg-[#E8EDEA] text-[#8B9690]",
                      ].join(" ")}
                    >
                      {index < 6 ? "✓" : "•"}
                    </div>
                    <span className="mt-1 block text-[9px] text-[#7C8881]">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_45px_rgba(22,80,55,0.10)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#728079]">هدف اليوم</p>
                  <p className="mt-1 text-lg font-black text-[#0B6B49]">
                    20 دقيقة
                  </p>
                </div>
                <CalendarCheck size={27} className="text-[#0B6B49]" />
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#E5ECE8]">
                <div className="h-full w-[65%] rounded-full bg-[#23AD74]" />
              </div>
              <p className="mt-2 text-[11px] font-bold text-[#728079]">
                أنجزت 13 من 20 دقيقة
              </p>
            </div>

            <div className="rounded-[28px] border-b-8 border-[#D96E0D] bg-[#FF941F] p-5 text-white shadow-[0_18px_40px_rgba(255,148,31,0.22)]">
              <Trophy size={30} />
              <p className="mt-3 text-xs font-bold text-white/80">
                التحدي الأسبوعي
              </p>
              <h3 className="mt-1 text-xl font-black">بطل المفردات</h3>
              <p className="mt-2 text-xs leading-6 text-white/85">
                تعلّم 30 كلمة جديدة قبل نهاية الأسبوع.
              </p>
              <p className="mt-4 text-sm font-black">18 / 30 كلمة</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
