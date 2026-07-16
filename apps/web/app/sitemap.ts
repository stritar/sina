import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { LOCALE_CODES, DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { languageAlternates } from "@/lib/i18n/metadata";

const BASE = "https://sinahub.app";

// Static sitemap generated at build (no request-time work). Every locale's docs
// pages plus the landing pages, each carrying its `hreflang` alternates.
export const dynamic = "force-static";

function absolute(languages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languages).map(([code, path]) => [code, `${BASE}${path}`]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Landing pages.
  for (const lang of LOCALE_CODES) {
    const path = lang === DEFAULT_LOCALE ? "/" : `/${lang}`;
    entries.push({ url: `${BASE}${path}` });
  }

  // Docs pages, per locale, with hreflang alternates.
  for (const lang of LOCALE_CODES) {
    for (const page of source.getPages(lang)) {
      entries.push({
        url: `${BASE}${page.url}`,
        alternates: { languages: absolute(languageAlternates(page.url)) },
      });
    }
  }

  return entries;
}
