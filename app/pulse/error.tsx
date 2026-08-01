"use client";

import styles from "./pulse-polish.module.css";

export default function PulseError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.fullError}>
      <div className={styles.errorOrb}>ب</div>
      <span>BAYAN PULSE</span>
      <h1>تعذر فتح نبض بيان الآن.</h1>
      <p>لم نفقد المحتوى. حاول مرة أخرى، أو تحقق من اتصالك بالإنترنت.</p>
      <button onClick={reset}>إعادة المحاولة</button>
    </main>
  );
}
