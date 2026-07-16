import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

/**
 * Prebuilt static search index. `revalidate = false` + `staticGET` emit the
 * Orama index as a static JSON asset at build; the client (`Search.tsx`,
 * `useDocsSearch({ type: "static", locale })`) downloads and queries it entirely
 * client-side. No server runtime — safe for Cloudflare Pages static hosting.
 *
 * i18n: the loader carries `i18n`, so `createFromSource` partitions the index by
 * locale automatically — search on a `/es/...` page returns Spanish results.
 * We keep the default (English) tokenizer for every locale to avoid bundling
 * per-language stemmers; CJK (zh/ja) therefore matches on titles/descriptions
 * and substrings rather than word-segmented tokens. Good enough for docs search;
 * revisit with `@orama/tokenizers` if CJK recall proves too low.
 */
export const revalidate = false;

// Explicit index function: the v14 `server` runtime doesn't always surface
// `structuredData` to the default indexer during static export, so we build the
// index ourselves and fall back to an empty structure (title/description are
// always indexed, so search still resolves pages by name).
export const { staticGET: GET } = createFromSource(source, {
  // Map each locale to an Orama tokenizer language. Orama ships no Chinese or
  // Japanese tokenizer, so zh/ja fall back to the English tokenizer (they still
  // match on titles/descriptions and substrings). The others use their own
  // stemmer for better recall.
  localeMap: {
    en: "english",
    es: "spanish",
    fr: "french",
    de: "german",
    zh: "english",
    ja: "english",
  },
  buildIndex: (page) => ({
    id: page.url,
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    structuredData: page.data.structuredData ?? { headings: [], contents: [] },
  }),
});
