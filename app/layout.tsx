import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "../src/providers/AppProviders";

export const metadata: Metadata = {
  title: "Arabic Department | King's College Doha",
  description:
    "The digital portal for the Arabic Department at King's College Doha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
