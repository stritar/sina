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
    <dl className={cn("divide-y divide-border-subtle", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-3">
          <dt className={cn("text-sm", item.emphasis ? "font-medium text-text" : "text-text-muted")}>
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-right text-text",
              item.emphasis ? "text-base font-semibold" : "text-sm font-medium",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
