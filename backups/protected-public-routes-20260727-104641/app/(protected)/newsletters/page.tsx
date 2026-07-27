import Link from "next/link";
import { Download, Home, Newspaper } from "lucide-react";
import { siteContent } from "@/src/data/site-content";

export default function NewslettersPage() {
  const newsletter = siteContent.weeklyNewsletter;

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9EF] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="flex items-center gap-2 font-black text-[#0B6B49]">
          <Home size={17} />
          الرئيسية
        </Link>

        <h1 className="mt-6 text-4xl font-black text-[#0B6B49]">
          النشرة الأسبوعية
        </h1>

        <article className="mt-6 grid overflow-hidden rounded-[34px] bg-white shadow-xl lg:grid-cols-[300px_1fr]">
          <div className="flex min-h-72 items-center justify-center bg-[#0B6B49] text-white">
            <div className="text-center">
              <Newspaper size={58} className="mx-auto" />
              <p className="mt-4 text-2xl font-black">{newsletter.weekAr}</p>
              <p className="text-xs text-white/65">{newsletter.academicYear}</p>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-3xl font-black">{newsletter.titleAr}</h2>
            <p className="mt-2 font-bold text-[#0B6B49]">{newsletter.titleEn}</p>
            <p className="mt-6 leading-8 text-[#65736C]">{newsletter.summaryAr}</p>

            <button className="mt-7 flex items-center gap-2 rounded-xl bg-[#FF941F] px-5 py-3 font-black text-white">
              <Download size={18} />
              تحميل النشرة
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}
