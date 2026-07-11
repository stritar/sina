import type { Page } from "fumadocs-core/source";
import { getMDXComponents } from "./mdx-components";
import { DocsToolbar } from "./DocsToolbar";
import { DocsTOC } from "./DocsTOC";
import { DocsPager } from "./DocsPager";
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

export function DocsArticle({ page }: { page: DocsPage }) {
  const MDX = page.data.body;

  return (
    <div className={styles.page}>
      <article className={styles.prose}>
        <DocsToolbar url={page.url} />
        <h1 className={styles.title}>{page.data.title}</h1>
        {page.data.description ? <p className={styles.lead}>{page.data.description}</p> : null}
        <MDX components={getMDXComponents()} />
        <DocsPager url={page.url} />
      </article>
      <DocsTOC items={page.data.toc} />
    </div>
  );
}
