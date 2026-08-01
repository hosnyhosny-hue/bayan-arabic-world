import Link from "next/link";
import styles from "./bayan-visual-refresh.module.css";

export default function BayanPremiumShell({
  children,
  active = "parents",
}: {
  children: React.ReactNode;
  active?: "parents" | "pulse";
}) {
  return (
    <main className={styles.page}>
      <div className={styles.navWrap}>
        <div className={`${styles.container} ${styles.nav}`}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>ب</span>
            <span className={styles.brandText}>
              <strong>BAYAN Arabic World</strong>
              <small>King&apos;s College Doha</small>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="/parents" aria-current={active === "parents" ? "page" : undefined}>العائلة</Link>
            <Link href="/pulse" aria-current={active === "pulse" ? "page" : undefined}>نبض بيان</Link>
            <Link href="/achievements">الإنجازات</Link>
            <Link href="/learn/arabic-b">Arabic B</Link>
          </nav>

          <div className={styles.navActions}>
            <button className={styles.iconButton} aria-label="بحث">⌕</button>
            <Link className={styles.secondaryButton} href="/pulse">استكشف النبض</Link>
            <Link className={styles.primaryButton} href="/login">دخول العائلة</Link>
          </div>
        </div>
      </div>

      {children}

      <footer className={`${styles.container} ${styles.footer}`}>
        BAYAN Arabic World · تجربة تعليمية رقمية من King&apos;s College Doha
      </footer>
    </main>
  );
}
