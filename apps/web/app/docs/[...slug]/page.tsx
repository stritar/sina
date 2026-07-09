import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/app/components/docs/mdx-components";
import { DocsTOC } from "@/app/components/docs/DocsTOC";
import { DocsPager } from "@/app/components/docs/DocsPager";
import { CopyMarkdown } from "@/app/components/docs/CopyMarkdown";
import styles from "../page.module.css";

// Fully static: only the generated slugs render; anything else 404s at build.
// A *required* catch-all (not `[[...slug]]`) — the index `/docs` is served by the
// sibling `../page.tsx`. next-on-pages can only emit a required catch-all as static
// assets; the optional form is mis-classified as a dynamic (Edge Runtime) route.
export const dynamicParams = false;

export function generateStaticParams() {
  // Drop the empty-slug index entry; `/docs` is the sibling static page.
  return source.generateParams().filter((params) => params.slug.length > 0);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <div className={styles.page}>
      <article className={styles.prose}>
        <h1 className={styles.title}>{page.data.title}</h1>
        {page.data.description ? <p className={styles.lead}>{page.data.description}</p> : null}
        <CopyMarkdown rawPath={`/llms/docs/${slug.join("/")}.md`} />
        <MDX components={getMDXComponents()} />
        <DocsPager url={page.url} />
      </article>
      <DocsTOC items={page.data.toc} />
    </div>
  );
}
