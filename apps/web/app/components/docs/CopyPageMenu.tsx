"use client";

import { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@sina-design-system/core";
import { Copy, Check, CaretDown, MarkdownLogo, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import styles from "./CopyPageMenu.module.css";

const COPIED_RESET_MS = 1500;

/**
 * The "Copy Page" split control: the left segment copies the page's raw Markdown
 * to the clipboard, the caret opens the agent hand-off menu.
 *
 * The Markdown is not re-derived here — `scripts/generate-llms.mjs` already
 * emits every page's source as a static asset under `/llms/docs/**.md`, so this
 * just fetches it. That keeps the site Cloudflare-static-deployable: a Route
 * Handler reading the `.mdx` at request time would need the Node runtime and
 * would fail the `next-on-pages` build (see /cf-pages-safe).
 */
export function CopyPageMenu({ markdownUrl }: { markdownUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPage() {
    try {
      const res = await fetch(markdownUrl);
      if (!res.ok) return;
      await navigator.clipboard.writeText(await res.text());
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Fetch or clipboard denied (e.g. non-secure context) — leave the label.
    }
  }

  // Absolute URL, resolved at click time rather than baked in at build: the same
  // markup then works on localhost, a CF preview deployment, and sinahub.app.
  function openInClaude() {
    const absolute = new URL(markdownUrl, window.location.origin).href;
    const prompt = `Read ${absolute} — I want to ask questions about this SINA documentation page.`;
    window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`, "_blank", "noopener");
  }

  return (
    <div className={styles.split}>
      <Button
        variant="secondary"
        size="sm"
        className={styles.copy}
        onClick={copyPage}
        iconLeft={
          copied ? (
            <Check aria-hidden weight="bold" />
          ) : (
            <Copy aria-hidden weight="bold" />
          )
        }
      >
        {copied ? "Copied" : "Copy Page"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className={styles.caret}
            aria-label="More page actions"
          >
            <CaretDown aria-hidden weight="bold" className={styles.caretIcon} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href={markdownUrl} target="_blank" rel="noreferrer">
              <MarkdownLogo aria-hidden weight="bold" className={styles.itemIcon} />
              View as Markdown
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={openInClaude}>
            <ArrowSquareOut aria-hidden weight="bold" className={styles.itemIcon} />
            Open in Claude
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
