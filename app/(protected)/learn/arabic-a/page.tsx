import Link from "next/link";
import { BookOpen, Home, PenLine, Search, Sparkles } from "lucide-react";

export default function ArabicAPage() {
  const units = [
    ["القراءة والتحليل", "Reading & Analysis", BookOpen],
    ["الكتابة المنظمة", "Structured Writing", PenLine],
    ["الأدب والثقافة", "Literature & Culture", Sparkles],
    ["البحث والتفكير النقدي", "Research & Critical Thinking", Search],
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9EF] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/student" className="flex items-center gap-2 text-sm font-black text-[#0B6B49]">
          <Home size={17} />
          بوابة الطلاب
        </Link>

        <section className="mt-5 rounded-[36px] bg-[#0B6B49] p-9 text-white">
          <p className="font-bold text-white/65">Arabic A</p>
          <h1 className="mt-2 text-4xl font-black">العربية للناطقين بها</h1>
          <p className="mt-5 max-w-3xl leading-8 text-white/80">
            مسار أكاديمي متدرج يطور القراءة المتعمقة، والتحليل، والكتابة،
            والأدب، والبلاغة، والبحث، والتفكير النقدي.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {units.map(([ar, en, Icon]) => {
            const UnitIcon = Icon as typeof BookOpen;
            return (
              <article key={ar as string} className="rounded-[28px] bg-white p-6 shadow-sm">
                <UnitIcon size={28} className="text-[#0B6B49]" />
                <h2 className="mt-4 text-xl font-black">{ar as string}</h2>
                <p className="mt-1 text-sm font-bold text-[#0B6B49]">{en as string}</p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
