"use client";

import { useParams } from "next/navigation";
import SectionExperience from "@/src/components/world/SectionExperience";

export default function DynamicSectionPage() {
  const params = useParams<{ slug: string }>();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  return <SectionExperience slug={slug || ""} />;
}
