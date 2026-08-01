import type { Metadata } from "next";
import "./globals.css";
import { WorldProvider } from "@/src/context/WorldContext";
import "./styles/bayan-design-tokens.css";

export const metadata: Metadata = {
  title: "Bayan Arabic World | King's College Doha",
  description:
    "The digital home of Arabic learning at King's College Doha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <WorldProvider>{children}</WorldProvider>
      </body>
    </html>
  );
}
