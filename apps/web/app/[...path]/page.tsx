import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import {
  DEFAULT_LOCALE,
  TRANSLATED_LOCALE_CODES,
  isLocale,
  localeOf,
} from "@/lib/i18n/locales";
import { languageAlternates } from "@/lib/i18n/metadata";
import { getMessages } from "@/lib/i18n/messages";
import { DocsArticle } from "@/app/components/docs/DocsArticle";
import { DocsShell } from "@/app/components/docs/DocsShell";
import { MarketingHome } from "@/app/(marketing)/MarketingHome";

/**
 * Every translated (non-English) route, served by ONE required catch-all so the
 * whole subtree emits as static assets on `@cloudflare/next-on-pages`. English
 * stays at the un-prefixed routes (`app/docs`, `app/(marketing)`); this handles
 * `/<lang>` (landing), `/<lang>/docs` (index), and `/<lang>/docs/<slug>`.
 *
 * Why a root catch-all and not `app/[lang]/...`: next-on-pages can emit a
 * REQUIRED catch-all as static, but a bare dynamic-segment index (`/[lang]/docs`)
 * becomes a function it demands run on the Edge — which would pull the whole docs
 * render stack into the 1 MiB worker. A required catch-all sidesteps that.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  const englishSlugs = source
    .getPages(DEFAULT_LOCALE)
    .map((page) => page.slugs)
    .filter((slug) => slug.length > 0);

  const params: { path: string[] }[] = [];
  for (const lang of TRANSLATED_LOCALE_CODES) {
    params.push({ path: [lang] }); // /es           (landing)
    params.push({ path: [lang, "docs"] }); // /es/docs      (docs index)
    for (const slug of englishSlugs) {
      params.push({ path: [lang, "docs", ...slug] }); // /es/docs/<slug>
    }
  }
  return params;
}

/** Resolve a `path` param into { locale, kind, slug }, or null if it isn't ours. */
function route(path: string[]) {
  const [lang, ...rest] = path;
  if (!lang || !isLocale(lang) || lang === DEFAULT_LOCALE) return null;
  if (rest.length === 0) return { lang, kind: "home" as const, slug: [] as string[] };
  if (rest[0] === "docs") return { lang, kind: "docs" as const, slug: rest.slice(1) };
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const r = route(path);
  if (!r) return {};
  if (r.kind === "home") {
    const messages = getMessages(r.lang);
    return {
      title: `SINA — ${messages.marketing.cta}`,
      alternates: { canonical: `/${r.lang}`, languages: languageAlternates(`/${r.lang}`) },
    };
  }
  const page = source.getPage(r.slug.length ? r.slug : undefined, r.lang);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url, languages: languageAlternates(page.url) },
  };
}

export default async function LocalizedCatchAll({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const r = route(path);
  if (!r) notFound();

  if (r.kind === "home") {
    return (
      <div lang={r.lang} dir={localeOf(r.lang).dir}>
        <MarketingHome locale={r.lang} />
      </div>
    );
  }

  const page = source.getPage(r.slug.length ? r.slug : undefined, r.lang);
  if (!page) notFound();

  return (
    <div lang={r.lang} dir={localeOf(r.lang).dir}>
      <DocsShell locale={r.lang}>
        <DocsArticle page={page} locale={r.lang} />
      </DocsShell>
    </div>
  );
}
