import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { source } from "@/lib/source";

// Per-page raw Markdown export at `/llms/<...slug>` (e.g. `/llms/docs/concepts/
// audit-trail`), so an agent can fetch a doc's source. Fully static — the slugs
// come from the same generated set as the HTML pages; anything else 404s.
export const dynamic = "force-static";
export const dynamicParams = false;

const CONTENT_ROOT = join(process.cwd(), "content", "docs");

export function generateStaticParams() {
  // `/llms/docs/...` mirrors the page URLs; drop the empty-slug index.
  return source
    .generateParams()
    .filter((params) => params.slug.length > 0)
    .map((params) => ({ slug: ["docs", ...params.slug] }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  // Strip the leading "docs" segment to map back onto the content tree.
  const docSlug = slug[0] === "docs" ? slug.slice(1) : slug;
  const page = source.getPage(docSlug);
  if (!page) return new Response("Not found", { status: 404 });

  const rel = docSlug.join("/");
  // A page is either `<slug>.mdx` or `<slug>/index.mdx` (folder index).
  const candidates = [`${rel}.mdx`, join(rel, "index.mdx")];
  for (const candidate of candidates) {
    try {
      const raw = await readFile(join(CONTENT_ROOT, candidate), "utf8");
      return new Response(raw, {
        headers: { "content-type": "text/markdown; charset=utf-8" },
      });
    } catch {
      // Try the next candidate.
    }
  }
  return new Response("Not found", { status: 404 });
}
