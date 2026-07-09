import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Emit each doc's raw Markdown as a static asset under
 * `public/llms/docs/**.md` (e.g. `/llms/docs/concepts/audit-trail.md`) so an
 * agent can fetch a page's source.
 *
 * This replaces the old dynamic `/llms/[...slug]` Route Handler, which read the
 * `.mdx` with `node:fs` at request time. `@cloudflare/next-on-pages` emits a
 * runtime function for every Route Handler and requires it to run on the Edge
 * runtime — a `node:fs` handler can't, so it failed the Cloudflare Pages build.
 * Pre-generating the files at build sidesteps the function entirely.
 */
const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_ROOT = join(webRoot, "content", "docs");
const OUT_ROOT = join(webRoot, "public", "llms", "docs");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
}

// `architecture/three-layers.mdx` -> `architecture/three-layers`
// `components/index.mdx`           -> `components` (folder index)
// `index.mdx`                      -> "" (the docs index; no raw export)
function toSlug(file) {
  return relative(CONTENT_ROOT, file)
    .replace(/\\/g, "/")
    .replace(/\.mdx$/, "")
    .replace(/\/index$/, "")
    .replace(/^index$/, "");
}

async function main() {
  await rm(OUT_ROOT, { recursive: true, force: true });
  const files = await walk(CONTENT_ROOT);
  let count = 0;
  for (const file of files) {
    const slug = toSlug(file);
    if (!slug) continue; // skip the docs index — mirrors the old route
    const raw = await readFile(file, "utf8");
    const out = join(OUT_ROOT, `${slug}.md`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, raw, "utf8");
    count++;
  }
  console.log(`[llms] wrote ${count} raw markdown files to public/llms/docs`);
}

main().catch((err) => {
  console.error("[llms] generation failed:", err);
  process.exit(1);
});
