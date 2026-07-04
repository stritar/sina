/**
 * @sina-design-system/core — SummaryList
 *
 * Key/value review rows on a semantic `<dl>`. Hairline dividers between rows; an
 * `emphasis` row (e.g. a total) is weighted heavier; a row `value` can be any
 * node, so it may carry a `Badge`. Presentational and domain-agnostic — the
 * From / To / Amount labels are the caller's content.
 */
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import styles from "./SummaryList.module.css";

export interface SummaryItem {
  /** Row key (term). */
  label: ReactNode;
  /** Row value (detail) — text, a Badge, etc. */
  value: ReactNode;
  /** Render heavier, for a total / emphasized row. */
  emphasis?: boolean;
}

export interface SummaryListProps {
  items: SummaryItem[];
  className?: string;
}

export function SummaryList({ items, className }: SummaryListProps) {
  return (
    <dl className={cn(styles.list, className)}>
      {items.map((item, i) => (
        <div key={i} className={styles.row}>
          <dt className={cn(styles.label, item.emphasis ? styles.labelEmphasis : styles.labelMuted)}>
            {item.label}
          </dt>
          <dd className={cn(styles.value, item.emphasis ? styles.valueEmphasis : styles.valueDefault)}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
