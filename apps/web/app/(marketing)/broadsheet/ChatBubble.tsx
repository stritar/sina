import type { HTMLAttributes } from "react";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./ChatBubble.module.css";

/** `user` = the sent ask (sage, right-aligned); `outcome` = the reply surface. */
export type ChatBubbleVariant = "user" | "outcome";

export type ChatBubbleProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ChatBubbleVariant;
  size?: ButtonSize;
};

/**
 * Broadsheet chat bubble: one turn of the conversation lane. The `user` variant
 * reads as a sent message (sage fill, right-aligned in a column flex parent);
 * the `outcome` variant is a bordered reply surface whose children carry the
 * actual answer (text, or a mounted component supplied by the caller). Both are
 * soft 24px pills carrying only their body: the lane is labelled by the
 * surrounding GateCard/TraceCard, not by the bubble. Enters with a fade/rise on
 * `--sinamk-duration--enter` (zeroed under reduced motion). The `data-broadsheet`
 * marker earns the global blue focus outline; this component never authors
 * focus styles.
 */
export function ChatBubble({
  variant = "user",
  size = "md",
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
      <div className={styles.body}>{children}</div>
    </div>
  );
}
