import Link from "next/link";
import styles from "./placeholder.module.css";

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span>CONTROL CENTER FOUNDATION</span>
        <div className={styles.icon}>ب</div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div>
          <Link href="/admin/pulse-control-center">العودة إلى مركز القيادة</Link>
          <a href="/pulse" target="_blank" rel="noreferrer">معاينة النبض ↗</a>
        </div>
      </section>
    </main>
  );
}
