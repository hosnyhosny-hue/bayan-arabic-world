"use client";

import { motion } from "framer-motion";
import { Lock, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LearningStatus } from "../../data/learning-path";

type LearningNodeProps = {
  titleAr: string;
  titleEn: string;
  icon: LucideIcon;
  status: LearningStatus;
  stars: number;
  xp: number;
  index: number;
};

export default function LearningNode({
  titleAr,
  titleEn,
  icon: Icon,
  status,
  stars,
  xp,
  index,
}: LearningNodeProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isActive = status === "active";

  const alignment =
    index % 3 === 0
      ? "translate-x-0"
      : index % 3 === 1
        ? "translate-x-16"
        : "-translate-x-10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`relative flex flex-col items-center ${alignment}`}
    >
      <motion.button
        type="button"
        whileHover={!isLocked ? { scale: 1.08, y: -4 } : undefined}
        whileTap={!isLocked ? { scale: 0.94 } : undefined}
        disabled={isLocked}
        className={[
          "relative flex h-24 w-24 items-center justify-center rounded-full border-b-[8px] shadow-xl transition",
          isCompleted
            ? "border-[#0B6B49] bg-[#20B477] text-white"
            : "",
          isActive
            ? "border-[#D96E0D] bg-[#FF941F] text-white ring-8 ring-[#FF941F]/15"
            : "",
          status === "unlocked"
            ? "border-[#CBD7CF] bg-white text-[#0B6B49]"
            : "",
          isLocked
            ? "cursor-not-allowed border-[#C7CCC9] bg-[#E5E9E6] text-[#9DA6A0]"
            : "",
        ].join(" ")}
      >
        {isLocked ? <Lock size={31} /> : <Icon size={36} strokeWidth={2.2} />}

        {isActive && (
          <span className="absolute -top-4 rounded-full bg-[#0B6B49] px-3 py-1 text-[10px] font-black text-white shadow-lg">
            ابدأ الآن
          </span>
        )}
      </motion.button>

      <div className="mt-3 text-center">
        <h3 className="text-sm font-black text-[#22312A]">{titleAr}</h3>
        <p className="text-[10px] font-semibold text-[#728079]">{titleEn}</p>

        <div className="mt-1 flex items-center justify-center gap-1">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              size={12}
              className={
                star <= stars
                  ? "fill-[#FF941F] text-[#FF941F]"
                  : "text-[#D7DDD9]"
              }
            />
          ))}
          <span className="mr-1 text-[10px] font-bold text-[#0B6B49]">
            {xp} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}
