import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

/**
 * Prebuilt static search index. `revalidate = false` + `staticGET` emit the
 * Orama index as a static JSON asset at build; the client (`Search.tsx`,
 * `useDocsSearch({ type: "static" })`) downloads and queries it entirely
 * client-side. No server runtime — safe for Cloudflare Pages static hosting.
 */
export const revalidate = false;

// Explicit index function: the v14 `server` runtime doesn't always surface
// `structuredData` to the default indexer during static export, so we build the
// index ourselves and fall back to an empty structure (title/description are
// always indexed, so search still resolves pages by name).
export const { staticGET: GET } = createFromSource(source, {
  buildIndex: (page) => ({
    id: page.url,
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    structuredData: page.data.structuredData ?? { headings: [], contents: [] },
  }),
});
