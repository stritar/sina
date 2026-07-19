import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./ChatBubble.module.css";

/** `user` = the sent ask (sage, right-aligned); `outcome` = the reply surface. */
export type ChatBubbleVariant = "user" | "outcome";

export type ChatBubbleProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ChatBubbleVariant;
  /** Small lane label above the body (e.g. "You", "What renders"). */
  kicker?: string;
  size?: ButtonSize;
  icon?: ReactNode;
};

/**
 * Broadsheet chat bubble: one turn of the conversation lane. The `user` variant
 * reads as a sent message (sage fill, right-aligned in a column flex parent);
 * the `outcome` variant is a bordered reply surface whose children carry the
 * actual answer (text, or a mounted component supplied by the caller). Enters
 * with a fade/rise on `--sinamk-duration--enter` (zeroed under reduced motion).
 * The `data-broadsheet` marker earns the global blue focus outline; this
 * component never authors focus styles.
 */
export function ChatBubble({
  variant = "user",
  kicker,
  size = "md",
  icon,
  className,
  children,
  ...rest
}: ChatBubbleProps) {
  return (
    <div
      {...rest}
      data-broadsheet=""
      data-variant={variant}
      data-size={size}
      className={cn(styles.root, className)}
    >
      {kicker ? (
        <span className={styles.kicker}>
          {icon ? (
            <span className={styles.slot} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className={styles.kickerLabel}>{kicker}</span>
        </span>
      ) : null}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
