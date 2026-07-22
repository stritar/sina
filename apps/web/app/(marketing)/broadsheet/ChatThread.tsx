"use client";

import { forwardRef, useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "./cn";
import styles from "./ChatThread.module.css";

export type ChatThreadProps = Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> & {
  /** Required accessible name — the thread is a focusable scrolling region. */
  "aria-label": string;
  /** Thread height preset: how much conversation is visible at once. `fill`
   * stretches to the parent (a flex column host) instead of a fixed height. */
  size?: "sm" | "md" | "lg" | "fill";
};

/**
 * Broadsheet chat thread: the scrolling messenger column the chat pieces stack
 * in. Bottom-anchored like a real chat (new turns push older ones up), fixed
 * height so it scrolls internally and never grows its parent. The root is the
 * scroll element (the forwarded ref points at it so a playback driver can set
 * `scrollTop`), carries `tabIndex=0` so keyboard users can scroll it, and is a
 * labelled region — deliberately NOT `role="log"`/aria-live: an autoplaying
 * thread must never narrate itself to screen readers uninvited. On mount it
 * rests at the bottom, where the newest turn is.
 */
export const ChatThread = forwardRef<HTMLDivElement, ChatThreadProps>(function ChatThread(
  { size = "md", className, children, ...rest },
  ref,
) {
  const localRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = localRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  return (
    <div
      {...rest}
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      role="region"
      tabIndex={0}
      data-broadsheet=""
      data-size={size}
      className={cn(styles.root, className)}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  );
});
