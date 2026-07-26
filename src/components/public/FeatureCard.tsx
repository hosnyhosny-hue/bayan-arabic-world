import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type Props = {
  titleAr: string;
  titleEn: string;
  description: string;
  href: string;
  icon: ReactNode;
  featured?: boolean;
};

export default function FeatureCard({
  titleAr,
  titleEn,
  description,
  href,
  icon,
  featured = false,
}: Props) {
  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-[28px] border p-6 transition hover:-translate-y-1",
        featured
          ? "border-[#0B6B49] bg-[#0B6B49] text-white shadow-[0_24px_60px_rgba(11,107,73,0.22)]"
          : "border-white/80 bg-white/90 text-[#22312A] shadow-[0_16px_45px_rgba(22,80,55,0.09)]",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          featured
            ? "bg-white/15 text-white"
            : "bg-[#EEF8F2] text-[#0B6B49]",
        ].join(" ")}
      >
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black">{titleAr}</h3>
      <p
        dir="ltr"
        className={[
          "mt-1 text-left text-xs font-bold",
          featured ? "text-white/65" : "text-[#0B6B49]",
        ].join(" ")}
      >
        {titleEn}
      </p>

      <p
        className={[
          "mt-4 text-sm leading-7",
          featured ? "text-white/80" : "text-[#65736C]",
        ].join(" ")}
      >
        {description}
      </p>

      <span className="mt-5 flex items-center gap-2 text-xs font-black">
        اكتشف المزيد
        <ArrowLeft
          size={16}
          className="transition group-hover:-translate-x-1"
        />
      </span>
    </Link>
  );
}
