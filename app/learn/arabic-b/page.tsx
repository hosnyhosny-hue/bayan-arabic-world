import type { Metadata } from "next";

import ArabicBJourneyEngine from "./components/ArabicBJourneyEngine";
import { getGraphExperience } from "./lib/graph-experience";
import { createJourneyPayload } from "./lib/journey-engine";

export const metadata: Metadata = {
  title: "BAYAN Arabic B | Your Arabic Journey",
  description:
    "Learn Arabic through adaptive real-life journeys, missions and interactive worlds.",
};

export const dynamic = "force-static";

export default function ArabicBPage() {
  const graph = getGraphExperience();
  const journey = createJourneyPayload(graph);

  return <ArabicBJourneyEngine payload={journey} />;
}
