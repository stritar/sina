"use client";

import type { TOCItemType } from "fumadocs-core/toc";
import { AnchorProvider, TOCItem } from "fumadocs-core/toc";
import { messages } from "./messages";
import styles from "./DocsTOC.module.css";

/**
 * On-page table of contents with scroll-spy, built on the headless
 * `fumadocs-core/toc` primitives (`AnchorProvider` watches the rendered heading
 * anchors; `TOCItem` flips `data-active`). Styled with `--sina-*`.
 */
export function DocsTOC({ items }: { items: TOCItemType[] }) {
  if (!items || items.length === 0) return null;

  return (
    <aside className={styles.toc} aria-label={messages.toc.heading}>
      <p className={styles.heading}>{messages.toc.heading}</p>
      <AnchorProvider toc={items}>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.url}>
              <TOCItem href={item.url} className={styles.item} data-depth={item.depth}>
                {item.title}
              </TOCItem>
            </li>
          ))}
        </ul>
      </AnchorProvider>
    </aside>
  );
}
