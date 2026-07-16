import Link from "next/link";
import { findNeighbour } from "fumadocs-core/server";
import { source } from "@/lib/source";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import styles from "./DocsPager.module.css";

/**
 * Previous / Next links at the bottom of every docs page, derived from the
 * same locale-scoped page tree the sidebar renders — guided linear reading
 * without touching `meta.json` twice. Server component; the tree order is the
 * nav order, and its node URLs are already locale-prefixed.
 */
export function DocsPager({ url, locale = DEFAULT_LOCALE }: { url: string; locale?: string }) {
  const { previous, next } = findNeighbour(source.getPageTree(locale), url);
  if (!previous && !next) return null;

  const messages = getMessages(locale);

  return (
    <nav className={styles.pager} aria-label="Docs pagination">
      {previous ? (
        <Link href={previous.url} className={styles.link}>
          <span className={styles.eyebrow}>← {messages.pager.previous}</span>
          <span className={styles.name}>{previous.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.url} className={`${styles.link} ${styles.next}`}>
          <span className={styles.eyebrow}>{messages.pager.next} →</span>
          <span className={styles.name}>{next.name}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
