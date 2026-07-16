import type { Page } from "fumadocs-core/source";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { getMDXComponents } from "./mdx-components";
import { DocsToolbar } from "./DocsToolbar";
import { DocsTOC } from "./DocsTOC";
import { DocsPager } from "./DocsPager";
import { GateTransportBoundary } from "./GateTransportBoundary";
import styles from "../../docs/page.module.css";

/**
 * The body of every docs page — toolbar, title, MDX, pager, TOC.
 *
 * Shared by `app/docs/page.tsx` (the index) and `app/docs/[...slug]/page.tsx`.
 * Those two stay separate routes because next-on-pages can't emit an *optional*
 * catch-all as static assets, but the markup they render is identical, so it
 * lives here once.
 */
// The loader's page shape is generic over the frontmatter; we only read these.
type DocsPage = Page<{
  title: string;
  description?: string;
  body: React.ComponentType<{ components: ReturnType<typeof getMDXComponents> }>;
  toc: Parameters<typeof DocsTOC>[0]["items"];
}>;

export function DocsArticle({
  page,
  locale = DEFAULT_LOCALE,
}: {
  page: DocsPage;
  locale?: string;
}) {
  const MDX = page.data.body;
  const messages = getMessages(locale);

  return (
    <div className={styles.page}>
      <article className={styles.column}>
        <DocsToolbar url={page.url} locale={locale} />
        <h1 className={styles.title}>{page.data.title}</h1>
        {page.data.description ? <p className={styles.lead}>{page.data.description}</p> : null}
        {locale !== DEFAULT_LOCALE ? (
          <p className={styles.machineNote}>{messages.notice.machineTranslated}</p>
        ) : null}
        {/* `.prose` styles MDX by element selector, so it wraps the body alone —
            chrome inside it would inherit list/link styling meant for content. */}
        <div className={styles.prose}>
          {/* A client provider around a server-rendered slot: the MDX still renders on
              the server, and context reaches any <GovernanceDemo> inside it — so the
              demos get their server gate without a single call site knowing. */}
          <GateTransportBoundary>
            <MDX components={getMDXComponents()} />
          </GateTransportBoundary>
        </div>
        <DocsPager url={page.url} locale={locale} />
      </article>
      <DocsTOC items={page.data.toc} />
    </div>
  );
}
