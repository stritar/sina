import type { ReactNode } from "react";
import Link from "next/link";
import { Glyph } from "./Glyph";
import { cx } from "./cx";
import styles from "./Card.module.css";

/**
 * A linked card for the docs — role-hub lanes, "next steps", related links, and
 * the primitives gallery. Renders an internal `next/link` (or external `<a>`),
 * with an optional eyebrow (a reading-lane label) and a trailing arrow.
 */

export function Card({
  href,
  title,
  eyebrow,
  children,
}: {
  href: string;
  title: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  const external = /^https?:\/\//.test(href);
  const inner = (
    <>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <span className={styles.head}>
        <span className={styles.title}>{title}</span>
        <Glyph name="arrow" size={16} />
      </span>
      {children ? <span className={styles.desc}>{children}</span> : null}
    </>
  );

  if (external) {
    return (
      <a className={styles.card} href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link className={styles.card} href={href}>
      {inner}
    </Link>
  );
}

export function CardGrid({
  columns = 2,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.grid, columns === 3 ? styles.cols3 : styles.cols2)}>
      {children}
    </div>
  );
}
