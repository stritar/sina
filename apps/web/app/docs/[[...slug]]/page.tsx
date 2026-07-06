import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/app/components/docs/mdx-components";
import { DocsTOC } from "@/app/components/docs/DocsTOC";
import styles from "./page.module.css";

// Fully static: only the generated slugs render; anything else 404s at build.
export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
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
        <MDX components={getMDXComponents()} />
      </article>
      <DocsTOC items={page.data.toc} />
    </div>
  );
}
