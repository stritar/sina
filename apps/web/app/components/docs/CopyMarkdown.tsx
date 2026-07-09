"use client";

import { useState } from "react";
import { Button } from "@sina-design-system/core";
import styles from "./CopyMarkdown.module.css";

const COPIED_RESET_MS = 1500;

/**
 * "Copy for LLM" — copies the page's raw Markdown (the static
 * `/llms/docs/**.md` asset emitted by `scripts/generate-llms.mjs`) to the
 * clipboard, plus a plain link to the raw file. On-brand for a design system
 * whose primary readers include AI agents.
 */
export function CopyMarkdown({ rawPath }: { rawPath: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      const res = await fetch(rawPath);
      if (!res.ok) throw new Error(String(res.status));
      await navigator.clipboard.writeText(await res.text());
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), COPIED_RESET_MS);
  }

  return (
    <div className={styles.row}>
      <Button variant="ghost" size="sm" onClick={copy}>
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy for LLM"}
      </Button>
      <a className={styles.raw} href={rawPath}>
        View as Markdown
      </a>
    </div>
  );
}
