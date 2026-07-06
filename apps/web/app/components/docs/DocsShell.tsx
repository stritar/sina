import type { ReactNode } from "react";
import type { Root } from "fumadocs-core/page-tree";
import { DocsHeader } from "./DocsHeader";
import { Sidebar } from "./Sidebar";
import styles from "./DocsShell.module.css";

/**
 * The docs frame — built entirely from SINA `core` primitives + `--sina-*`
 * tokens (headless fumadocs-core, no fumadocs-ui, no Tailwind). Real landmarks
 * (`header` / `nav` / `main`) carry the a11y structure; the mobile nav is a
 * focus-trapped `core` Dialog drawer inside the header.
 */
export function DocsShell({ tree, children }: { tree: Root; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <DocsHeader tree={tree} />
      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Documentation">
          <Sidebar tree={tree} />
        </nav>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
