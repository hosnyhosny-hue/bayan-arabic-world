import Link from "next/link";
import { Home, Trophy } from "lucide-react";
import { siteContent } from "../../src/data/site-content";

export default function AchievementsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9EF] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="flex items-center gap-2 font-black text-[#0B6B49]">
          <Home size={17} />
          الرئيسية
        </Link>

        <h1 className="mt-6 text-4xl font-black text-[#0B6B49]">
          إنجازات قسم اللغة العربية
        </h1>

        <div className="mt-7 space-y-4">
          {siteContent.achievements.map((item) => (
            <article key={item.id} className="rounded-[30px] bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DF] text-[#FF7A00]">
                <Trophy size={25} />
              </div>
              <p className="mt-5 text-xs font-black text-[#FF7A00]">
                {item.categoryAr} • {item.year}
              </p>
              <h2 className="mt-2 text-2xl font-black">{item.titleAr}</h2>
              <p className="mt-4 leading-8 text-[#65736C]">{item.descriptionAr}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
