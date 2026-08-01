import Link from "next/link";
import styles from "../pulse-polish.module.css";

export function EmptyState({
  title = "لا يوجد محتوى بعد",
  description = "سيظهر المحتوى الجديد هنا بمجرد نشره.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className={styles.stateCard}>
      <span className={styles.stateIcon}>◇</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href="/pulse" className={styles.stateAction}>العودة إلى النبض</Link>
    </section>
  );
}

export function ErrorState({
  title = "تعذر تحميل هذا الجزء",
  description = "تحقق من الاتصال ثم أعد المحاولة.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className={`${styles.stateCard} ${styles.errorState}`}>
      <span className={styles.stateIcon}>!</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className={styles.stateAction} onClick={() => window.location.reload()}>إعادة المحاولة</button>
    </section>
  );
}
