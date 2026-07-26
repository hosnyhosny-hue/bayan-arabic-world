"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "../context/LanguageContext";
import { SoundProvider } from "../context/SoundContext";

export default function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <SoundProvider>{children}</SoundProvider>
    </LanguageProvider>
  );
}
