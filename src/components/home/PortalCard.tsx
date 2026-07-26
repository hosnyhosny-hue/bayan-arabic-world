"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Props = {
  titleAr: string;
  titleEn: string;
  href: string;
  icon: LucideIcon;
};

export default function PortalCard({
  titleAr,
  titleEn,
  href,
  icon: Icon,
}: Props) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="min-w-0"
    >
      <Link
        href={href}
        className="group flex h-full min-h-[96px] flex-col items-center justify-center rounded-3xl border border-white/70 bg-white/90 px-2 py-3 text-center shadow-[0_12px_30px_rgba(11,93,59,0.12)] transition hover:border-[#F28C28]/60 hover:shadow-[0_18px_40px_rgba(11,93,59,0.18)]"
      >
        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B5D3B] to-[#18865A] text-white shadow-md transition group-hover:rotate-3">
          <Icon size={22} strokeWidth={1.8} />
        </span>

        <span className="line-clamp-1 text-xs font-bold text-[#26332D] sm:text-sm">
          {titleAr}
        </span>

        <span className="mt-0.5 line-clamp-1 text-[9px] font-medium text-[#18865A] sm:text-[10px]">
          {titleEn}
        </span>
      </Link>
    </motion.div>
  );
}
