import type { Metadata } from "next";
import EditorialStudioClient from "./EditorialStudioClient";

export const metadata: Metadata = {
  title: "BAYAN Editorial Studio",
  description:
    "إدارة الخبر الرئيسي وشريط أخبار BAYAN Pulse.",
};

export default function EditorialStudioPage() {
  return <EditorialStudioClient />;
}
