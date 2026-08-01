import styles from "../pulse-polish.module.css";

export default function PulseSkeleton() {
  return (
    <main className={styles.skeletonPage} aria-busy="true" aria-label="جاري تحميل نبض بيان">
      <div className={styles.skeletonHeader}>
        <i className={styles.skeletonLogo} />
        <i className={styles.skeletonNav} />
        <i className={styles.skeletonButton} />
      </div>

      <div className={styles.skeletonContainer}>
        <section className={styles.skeletonHero}>
          <i className={styles.skeletonBadge} />
          <i className={styles.skeletonTitle} />
          <i className={styles.skeletonTitleShort} />
          <i className={styles.skeletonText} />
          <i className={styles.skeletonAction} />
        </section>

        <div className={styles.skeletonChannels}>
          {Array.from({ length: 7 }).map((_, index) => <i key={index} />)}
        </div>

        <section className={styles.skeletonSection}>
          <i className={styles.skeletonHeading} />
          <div className={styles.skeletonStories}>
            {Array.from({ length: 6 }).map((_, index) => <i key={index} />)}
          </div>
        </section>

        <section className={styles.skeletonGrid}>
          <i className={styles.skeletonLead} />
          <div>
            <i className={styles.skeletonSide} />
            <i className={styles.skeletonSide} />
          </div>
        </section>
      </div>
    </main>
  );
}
