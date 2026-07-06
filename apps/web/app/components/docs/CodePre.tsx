"use client";

import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import { Button } from "@sina-design-system/core";
import styles from "./CodePre.module.css";

const COPIED_RESET_MS = 1500;

/**
 * Frames the shiki `<pre>` that fumadocs' `rehypeCode` already produced (its
 * inline theme colors are preserved) with a SINA border + a copy button. Used as
 * the MDX `pre` override.
 */
export function CodePre({ className, children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard denied (e.g. non-secure context) — leave the label unchanged.
    }
  }

  return (
    <div className={styles.wrap}>
      <Button
        variant="ghost"
        size="sm"
        className={styles.copy}
        onClick={copy}
        aria-label={copied ? "Copied to clipboard" : "Copy code"}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre ref={ref} className={[styles.pre, className].filter(Boolean).join(" ")} {...props}>
        {children}
      </pre>
    </div>
  );
}
