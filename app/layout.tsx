import type { Metadata } from "next";
import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import "./globals.css";
import AppProviders from "../src/providers/AppProviders";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const englishFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-english",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arabic Department | King's College Doha",
  description:
    "A bilingual digital learning world for the Arabic Department at King's College Doha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${arabicFont.variable} ${englishFont.variable}`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
