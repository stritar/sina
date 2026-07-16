import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { languageAlternates } from "@/lib/i18n/metadata";
import { DocsArticle } from "@/app/components/docs/DocsArticle";

// The docs index (`/docs`) — a plain static page, rendered from `index.mdx`.
// Split out from the required catch-all sibling so the route stays fully static
// (no optional catch-all, which next-on-pages cannot emit as static assets).
export function generateMetadata(): Metadata {
  const page = source.getPage(undefined, DEFAULT_LOCALE);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url, languages: languageAlternates(page.url) },
  };
}

export default function DocsIndexPage() {
  const page = source.getPage(undefined, DEFAULT_LOCALE);
  if (!page) notFound();

  return <DocsArticle page={page} locale={DEFAULT_LOCALE} />;
}
