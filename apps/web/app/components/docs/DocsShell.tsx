import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { DocsHeader } from "./DocsHeader";
import { Sidebar } from "./Sidebar";
import { LocaleProvider } from "./LocaleContext";
import styles from "./DocsShell.module.css";

/**
 * The docs frame — built entirely from SINA `core` primitives + `--sina-*`
 * tokens (headless fumadocs-core, no fumadocs-ui, no Tailwind). Real landmarks
 * (`header` / `nav` / `main`) carry the a11y structure; the mobile nav is a
 * focus-trapped `core` Dialog drawer inside the header.
 *
 * Locale-aware: derives this locale's page tree and provides the locale to the
 * client chrome (header, search, switchers) via `LocaleProvider`.
 */
export function DocsShell({ locale, children }: { locale: string; children: ReactNode }) {
  const tree = source.getPageTree(locale);
  return (
    <LocaleProvider locale={locale}>
      <div className={styles.shell}>
        <DocsHeader tree={tree} />
        <div className={styles.body}>
          <nav className={styles.sidebar} aria-label="Documentation">
            <Sidebar tree={tree} />
          </nav>
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </LocaleProvider>
  );
}
