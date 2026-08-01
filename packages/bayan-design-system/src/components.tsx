import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./components.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export function BayanButton({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    />
  );
}

export function BayanCard({
  children,
  elevated = false,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  elevated?: boolean;
}) {
  return (
    <article
      className={`${styles.card} ${elevated ? styles.elevated : ""} ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}

export function BayanBadge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "accent" | "success" | "warning" | "danger" | "neutral";
}) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

export function BayanSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
