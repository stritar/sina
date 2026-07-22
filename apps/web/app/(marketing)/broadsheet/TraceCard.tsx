import type { HTMLAttributes } from "react";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./TraceCard.module.css";

export type TraceCardProps = HTMLAttributes<HTMLDivElement> & {
  /** Small lane label (e.g. "Under the hood", "What the model emitted"). */
  kicker?: string;
  /** The intent verb, rendered in mono (e.g. `wire_transfer`). */
  verb?: string;
  /** One-line plain description of the emitted payload. */
  summary?: string;
  /** Raw payload text rendered as a mono code well. */
  code?: string;
  size?: ButtonSize;
};

/**
 * Broadsheet trace card: the "under the hood" lane of a chat exchange — the
 * machine-facing view of a turn (an intent verb, a one-line summary, the raw
 * payload in a mono well). The dashed border keeps the x-ray lane visually
 * distinct from the solid conversation bubbles. Purely presentational; the
 * `data-broadsheet` marker earns the global blue focus outline.
 */
export function TraceCard({
  kicker,
  verb,
  summary,
  code,
  size = "md",
  className,
  children,
  ...rest
}: TraceCardProps) {
  return (
    <div
      {...rest}
      data-broadsheet=""
      data-size={size}
      className={cn(styles.root, className)}
    >
      {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
      {verb || summary ? (
        <p className={styles.summary}>
          {verb ? <code className={styles.verb}>{verb}</code> : null}
          {summary}
        </p>
      ) : null}
      {code ? (
        <pre className={styles.code}>
          <code>{code}</code>
        </pre>
      ) : null}
      {children}
    </div>
  );
}
