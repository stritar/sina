"use client";

import { useState } from "react";
import Link from "next/link";
import { useDocsSearch } from "fumadocs-core/search/client";
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@sina-design-system/core";
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
        <Button variant="secondary" size="sm" className={styles.trigger}>
          Search…
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.panel}>
        <DialogTitle className={styles.title}>Search documentation</DialogTitle>
        <DialogDescription className={styles.srOnly}>
          Search the SINA docs by keyword.
        </DialogDescription>
        <input
          type="search"
          className={styles.input}
          placeholder="Search docs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search documentation"
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
          <p className={styles.empty}>No results.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
