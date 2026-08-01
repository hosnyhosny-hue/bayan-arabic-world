import type { Metadata } from "next";

import BayanStudioDashboard from "../../learn/arabic-b/components/BayanStudioDashboard";

export const metadata: Metadata = {
  title: "BAYAN Studio 5.0",
  description: "World, character, voice and story management for BAYAN Arabic B.",
};

export default function BayanStudioPage() {
  return <BayanStudioDashboard />;
}
