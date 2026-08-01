import Link from "next/link";
import styles from "../pulse-polish.module.css";

export default function OfflinePage() {
  return (
    <main className={styles.fullError}>
      <div className={styles.offlineOrb}>⌁</div>
      <span>OFFLINE MODE</span>
      <h1>نبض بيان متاح بوضع محدود.</h1>
      <p>يمكنك مشاهدة المحتوى المحفوظ سابقًا، وسنحدّث الصفحة تلقائيًا عند عودة الاتصال.</p>
      <Link href="/pulse">العودة إلى النسخة المحفوظة</Link>
    </main>
  );
}
