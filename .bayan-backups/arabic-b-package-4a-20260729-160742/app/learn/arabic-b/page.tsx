import type { Metadata } from "next";

import ArabicBKnowledgeExperience from "./components/ArabicBKnowledgeExperience";
import { getGraphExperience } from "./lib/graph-experience";

export const metadata: Metadata = {
  title: "BAYAN Arabic B | Arabic for Global Learners",
  description:
    "A connected Arabic learning journey powered by the BAYAN Knowledge Graph.",
};

export const dynamic = "force-static";

export default function ArabicBPage() {
  const payload = getGraphExperience();

  return (
    <ArabicBKnowledgeExperience
      payload={payload}
    />
  );
}
