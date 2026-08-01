"use client";

import { useEffect, useState } from "react";
import styles from "../pulse-polish.module.css";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className={styles.offlineBanner} role="status">
      <span>أنت غير متصل الآن.</span>
      <small>نعرض آخر نسخة متاحة من نبض بيان، وسيتم التحديث عند عودة الاتصال.</small>
    </div>
  );
}
