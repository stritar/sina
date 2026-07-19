import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { IconButton } from "./IconButton";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./ChatComposer.module.css";

export type ChatComposerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Typewriter progress rendered in the well (empty shows the placeholder). */
  text?: string;
  placeholder?: string;
  /** Show the blinking caret after the typed text. */
  caret?: boolean;
  /** The send glyph (a Phosphor node from the caller, never bundled here). */
  sendIcon: ReactNode;
  /** Required accessible name for the send button. */
  sendLabel: string;
  onSend?: () => void;
  sendDisabled?: boolean;
  size?: ButtonSize;
};

/**
 * Broadsheet chat composer: a display-only input well (the demo types into it;
 * it is not a real text field, so the well is aria-hidden) beside a real send
 * IconButton. The caret blinks on `--sinamk-duration--caret` and holds steady
 * under reduced motion. The send button inherits the global blue focus outline
 * through IconButton; the decorative well never takes focus.
 */
export function ChatComposer({
  text,
  placeholder,
  caret = false,
  sendIcon,
  sendLabel,
  onSend,
  sendDisabled = false,
  size = "md",
  className,
  ...rest
}: ChatComposerProps) {
  const typed = text != null && text !== "";
  return (
    <div
      {...rest}
      data-broadsheet=""
      data-size={size}
      className={cn(styles.root, className)}
    >
      <div className={styles.well} data-composer="" aria-hidden="true">
        {typed ? (
          <span className={styles.text}>
            {text}
            {caret ? <span className={styles.caret} /> : null}
          </span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
      </div>
      <IconButton
        variant="primary"
        size={size}
        icon={sendIcon}
        label={sendLabel}
        onClick={onSend}
        disabled={sendDisabled}
      />
    </div>
  );
}
