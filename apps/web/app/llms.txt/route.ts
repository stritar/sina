import { source } from "@/lib/source";

// Static `llms.txt` — an agent-consumable index of the docs. On-brand for a
// product about governing AI agents. Emitted as a static asset (Cloudflare Pages
// static export), like the search index.
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  const pages = source.getPages();

  const lines = [
    "# SINA — The Design System for AI Agents",
    "",
    "> SINA validates an LLM's UI intent against server-side Zod schemas, then",
    "> mounts an accessible, governed primitive — validate, then mount.",
    "",
    "## Docs",
    "",
    ...pages.map((page) => {
      const title = page.data.title ?? page.url;
      const description = page.data.description ? `: ${page.data.description}` : "";
      // Raw markdown for each page is emitted as a static asset at
      // `/llms<url>.md` (see scripts/generate-llms.mjs); the root index lands
      // at `/llms/docs/index.md`.
      const raw = page.url === "/docs" ? "/llms/docs/index.md" : `/llms${page.url}.md`;
      return `- [${title}](${page.url})${description} — raw: ${raw}`;
    }),
    "",
    "## Machine-readable",
    "",
    "- [DSDS catalog](/dsds/manifest.dsds.json): the whole system (components, tokens, patterns, guides) as Design System Documentation Schema JSON — see https://designsystemdocspec.org",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
