import type { Metadata } from "next";

import ArabicBWorldExperience from "../../components/ArabicBWorldExperience";
import { getWorldContent } from "../../lib/world-content";

const content = getWorldContent("canteen");

export const metadata: Metadata = {
  title: `${content.titleEn} | BAYAN Arabic B`,
  description: content.storyEn,
};

export default function WorldPage() {
  return <ArabicBWorldExperience content={content} />;
}
