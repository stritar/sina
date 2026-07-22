"use client";

import { useState } from "react";
import Link from "next/link";
import { useDocsSearch } from "fumadocs-core/search/client";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@sina-design-system/core";
import { messages } from "./messages";
import styles from "./Search.module.css";

/**
 * Client search over the prebuilt static Orama index served at `/api/search`
 * (no server runtime — Cloudflare-static-safe). A `core` Dialog + native search
 * input; results link into the docs and close the dialog.
 */
export function Search() {
  const [open, setOpen] = useState(false);
  const { search, setSearch, query } = useDocsSearch({ type: "static" });
  const results = Array.isArray(query.data) ? query.data : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Same anatomy as the header's GitHub link: `asChild`, so the icon slot and
            the label are the caller's own elements and each can be hidden on its own
            (label on a phone, glyph on desktop). The Button folds its label padding
            onto the root here, which is what lets the phone square center the glyph. */}
        <Button variant="secondary" size="sm" asChild className={styles.trigger}>
          <button type="button" aria-label={messages.search.title} title={messages.search.title}>
            <MagnifyingGlass weight="bold" className={styles.triggerIcon} aria-hidden="true" />
            <span className={styles.triggerLabel}>{messages.search.trigger}</span>
          </button>
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.panel}>
        <DialogTitle className={styles.title}>{messages.search.title}</DialogTitle>
        <DialogDescription className={styles.srOnly}>
          {messages.search.description}
        </DialogDescription>
        <input
          type="search"
          className={styles.input}
          placeholder={messages.search.placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={messages.search.title}
        />
        <ul className={styles.results}>
          {results.map((result) => (
            <li key={result.id}>
              <Link href={result.url} className={styles.result} onClick={() => setOpen(false)}>
                {result.content}
              </Link>
            </li>
          ))}
        </ul>
        {search.length > 0 && results.length === 0 && (
          <p className={styles.empty}>{messages.search.empty}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
