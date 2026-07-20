import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { IconButton } from "./IconButton";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./ChatComposer.module.css";

export type ChatComposerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Typewriter progress rendered in the field (empty shows the placeholder). */
  text?: string;
  placeholder?: string;
  /** Show the blinking caret after the typed text. */
  caret?: boolean;
  /** Decorative glyph in the leading slot (a Phosphor node from the caller). */
  leadingIcon?: ReactNode;
  /** Decorative glyph in the trailing slot, before the send button. */
  trailingIcon?: ReactNode;
  /** The send glyph (a Phosphor node from the caller, never bundled here). */
  sendIcon: ReactNode;
  /** Required accessible name for the send button. */
  sendLabel: string;
  onSend?: () => void;
  sendDisabled?: boolean;
  size?: ButtonSize;
};

/**
 * Broadsheet chat composer: one bordered field that holds everything — a
 * decorative leading glyph, the display-only typed text (the demo types into
 * it; it is not a real text field, so every part of the field is aria-hidden),
 * a decorative trailing glyph, and a real round send IconButton.
 *
 * The field itself is transparent, so the surface behind it shows through; only
 * the border and the ink track the theme. The caret blinks on
 * `--sinamk-duration--caret` and holds steady under reduced motion. The send
 * button inherits the global blue focus outline through IconButton and is the
 * composer's only focusable control.
 */
export function ChatComposer({
  text,
  placeholder,
  caret = false,
  leadingIcon,
  trailingIcon,
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
      data-composer=""
      data-size={size}
      className={cn(styles.root, className)}
    >
      {leadingIcon ? (
        <span className={styles.glyph} aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className={styles.body} aria-hidden="true">
        {typed ? (
          <span className={styles.text}>
            {text}
            {caret ? <span className={styles.caret} /> : null}
          </span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
      </span>
      {trailingIcon ? (
        <span className={styles.glyph} aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
      <IconButton
        variant="primary"
        size={size}
        className={styles.send}
        icon={sendIcon}
        label={sendLabel}
        onClick={onSend}
        disabled={sendDisabled}
      />
    </div>
  );
}
