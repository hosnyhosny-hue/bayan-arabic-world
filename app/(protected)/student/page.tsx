import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Home,
  MessageCircle,
} from "lucide-react";
import { siteContent } from "@/src/data/site-content";

export default function StudentPortalPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,#EAF8F0,#FFF9EF_52%,#F7EEDC)] px-4 py-6 text-[#22312A]"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-[#0B6B49] shadow-sm"
        >
          <Home size={17} />
          الرئيسية
        </Link>

        <section className="mt-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border-b-8 border-[#075039] bg-[#0B6B49] text-white">
            <GraduationCap size={39} />
          </div>

          <h1 className="mt-5 text-4xl font-black text-[#0B6B49]">
            اختر مسار تعلمك
          </h1>

          <p className="mt-2 font-bold text-[#65736C]">
            Choose Your Arabic Learning Path
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {siteContent.pathways.map((pathway, index) => (
            <Link
              key={pathway.id}
              href={pathway.href}
              className={[
                "group rounded-[34px] border p-8 shadow-[0_22px_60px_rgba(22,80,55,0.12)] transition hover:-translate-y-2",
                index === 0
                  ? "border-[#0B6B49] bg-[#0B6B49] text-white"
                  : "border-[#FF941F] bg-[#FF941F] text-white",
              ].join(" ")}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                {index === 0 ? (
                  <BookOpen size={31} />
                ) : (
                  <MessageCircle size={31} />
                )}
              </div>

              <h2 className="mt-6 text-3xl font-black">{pathway.titleAr}</h2>
              <p
                dir="ltr"
                className="mt-2 text-left text-lg font-black text-white/75"
              >
                {pathway.titleEn}
              </p>

              <p className="mt-5 text-sm leading-8 text-white/85">
                {pathway.descriptionAr}
              </p>

              <span className="mt-7 flex items-center gap-2 font-black">
                فتح المسار
                <ArrowLeft
                  size={19}
                  className="transition group-hover:-translate-x-2"
                />
              </span>
            </Link>
          ))}
        </section>

        <div className="mt-6 text-center">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#0B6B49] shadow-sm"
          >
            عرض نموذج لوحة التعلم
            <ArrowLeft size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}
