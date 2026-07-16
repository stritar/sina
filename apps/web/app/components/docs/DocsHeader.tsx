"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Root } from "fumadocs-core/page-tree";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@sina-design-system/core";
import { Sidebar } from "./Sidebar";
import { Search } from "./Search";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocale } from "./LocaleContext";
import { SinaLogo } from "./visuals/SinaLogo";
import styles from "./DocsHeader.module.css";

/**
 * Docs top bar: wordmark, search, and (on narrow screens) a focus-trapped
 * `core` Dialog nav drawer. The drawer closes on navigation.
 */
export function DocsHeader({ tree }: { tree: Root }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { messages } = useLocale();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.menuButton}
          aria-label={messages.header.openNav}
          onClick={() => setOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none">
            <path
              d="M2 4.5h14M2 9h14M2 13.5h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </Button>
        <Link href="/" className={styles.wordmark} aria-label={messages.header.home}>
          <SinaLogo className={styles.logo} />
        </Link>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.section}>{messages.header.section}</span>
      </div>

      <div className={styles.right}>
        <Search />
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.drawer}>
          <DialogTitle className={styles.drawerTitle}>{messages.header.drawerTitle}</DialogTitle>
          <DialogDescription className={styles.drawerDescription}>
            {messages.header.drawerDescription}
          </DialogDescription>
          <nav aria-label="Documentation menu">
            <Sidebar tree={tree} />
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
