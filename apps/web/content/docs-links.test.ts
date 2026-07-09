import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { walkDocs, CONTENT_ROOT } from "./docs-test-helpers";
// The single source of truth for moved-URL redirects (fed to next.config.mjs).
import { docsRedirects } from "../redirects.mjs";

/**
 * Guard: internal-link and redirect integrity.
 *
 * Every `/docs/...` href in the content must resolve to a live page, every
 * redirect rule in `redirects.mjs` must point at a live page, and no redirect
 * may loop or shadow a live page. This mechanizes the old manual "all internal
 * links resolve" audit — the safety net for any page move.
 *
 * NOTE redirects live in `redirects.mjs` → `next.config.mjs` (compiled into
 * the worker by next-on-pages), NOT in `public/_redirects` — Cloudflare never
 * applies `_redirects` to worker-handled requests, so a `_redirects` rule
 * silently 404s in production. Recipe: /new-doc-page.
 */

// The set of live docs URLs, derived from the content tree itself.
const liveUrls = new Set<string>(
  walkDocs().map((file) => {
    const rel = relative(CONTENT_ROOT, file)
      .replace(/\\/g, "/")
      .replace(/\.mdx$/, "")
      .replace(/\/index$/, "")
      .replace(/^index$/, "");
    return rel ? `/docs/${rel}` : "/docs";
  }),
);

function docsLinksIn(source: string): string[] {
  const links: string[] = [];
  for (const match of source.matchAll(/\]\((\/docs[^)#\s]*)/g)) links.push(match[1]!);
  for (const match of source.matchAll(/href="(\/docs[^"#]*)"/g)) links.push(match[1]!);
  return links.map((l) => l.replace(/\/$/, ""));
}

const pages = walkDocs().map((file) => ({
  rel: relative(CONTENT_ROOT, file),
  links: docsLinksIn(readFileSync(file, "utf8")),
}));

const redirectRules = docsRedirects as Array<{
  source: string;
  destination: string;
  permanent: boolean;
}>;

describe("docs links", () => {
  it("has links to check (guard is not vacuous)", () => {
    expect(pages.flatMap((p) => p.links).length).toBeGreaterThan(20);
  });

  it.each(pages.filter((p) => p.links.length > 0))("$rel links only to live pages", (page) => {
    const dead = page.links.filter((link) => !liveUrls.has(link));
    expect(dead).toEqual([]);
  });
});

describe("redirects", () => {
  it("has rules to check and every rule is permanent (301)", () => {
    expect(redirectRules.length).toBeGreaterThan(20);
    expect(redirectRules.every((r) => r.permanent)).toBe(true);
  });

  it("every redirect targets a live page (no chains)", () => {
    const dead = redirectRules.filter((r) => !liveUrls.has(r.destination));
    expect(dead.map((r) => `${r.source} -> ${r.destination}`)).toEqual([]);
  });

  it("no redirect loops or shadows a live page", () => {
    for (const r of redirectRules) {
      expect(r.source).not.toBe(r.destination);
      if (r.source.endsWith("/:path*")) {
        const prefix = r.source.slice(0, -":path*".length); // "/docs/ai/:path*" -> "/docs/ai/"
        const shadowed = [...liveUrls].filter((url) => url.startsWith(prefix));
        expect(shadowed).toEqual([]);
      } else {
        expect(liveUrls.has(r.source)).toBe(false);
      }
    }
  });
});
