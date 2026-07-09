import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/app/components/docs/mdx-components";
import { DocsTOC } from "@/app/components/docs/DocsTOC";
import { DocsPager } from "@/app/components/docs/DocsPager";
import { CopyMarkdown } from "@/app/components/docs/CopyMarkdown";
import styles from "./page.module.css";

// The docs index (`/docs`) — a plain static page, rendered from `index.mdx`.
// Split out from the required catch-all sibling so the route stays fully static
// (no optional catch-all, which next-on-pages cannot emit as static assets).
export function generateMetadata(): Metadata {
  const page = source.getPage(undefined);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

export default function DocsIndexPage() {
  const page = source.getPage(undefined);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <div className={styles.page}>
      <article className={styles.prose}>
        <h1 className={styles.title}>{page.data.title}</h1>
        {page.data.description ? <p className={styles.lead}>{page.data.description}</p> : null}
        <CopyMarkdown rawPath="/llms/docs/index.md" />
        <MDX components={getMDXComponents()} />
        <DocsPager url={page.url} />
      </article>
      <DocsTOC items={page.data.toc} />
    </div>
  );
}
