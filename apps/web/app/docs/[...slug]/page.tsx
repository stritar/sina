import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { languageAlternates } from "@/lib/i18n/metadata";
import { DocsArticle } from "@/app/components/docs/DocsArticle";

// Fully static: only the generated slugs render; anything else 404s at build.
// A *required* catch-all (not `[[...slug]]`) — the index `/docs` is served by the
// sibling `../page.tsx`. next-on-pages can only emit a required catch-all as static
// assets; the optional form is mis-classified as a dynamic (Edge Runtime) route.
export const dynamicParams = false;

export function generateStaticParams() {
  // The English (default-locale) tree only; `app/[lang]/docs` covers the rest.
  // Drop the empty-slug index entry; `/docs` is the sibling static page.
  return source
    .generateParams()
    .filter((params) => params.lang === DEFAULT_LOCALE && params.slug.length > 0)
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug, DEFAULT_LOCALE);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url, languages: languageAlternates(page.url) },
  };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug, DEFAULT_LOCALE);
  if (!page) notFound();

  return <DocsArticle page={page} locale={DEFAULT_LOCALE} />;
}
