import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guard: keep `apps/web` deployable to Cloudflare Pages via
 * `@cloudflare/next-on-pages`.
 *
 * next-on-pages emits a runtime function for EVERY Route Handler
 * (`app/**\/route.ts`) — even `dynamic = "force-static"` ones — and requires it
 * to run on the Edge runtime. A handler that imports a Node builtin (`node:fs`,
 * `node:path`, …) can't be Edge, so the whole Cloudflare Pages build ABORTS and
 * the site silently keeps serving the last successful deploy. This exact bug
 * (`app/llms/[...slug]/route.ts` reading `.mdx` with `node:fs`) froze the docs
 * deploy. Serve file/content-derived output as a static asset generated at build
 * instead (see `scripts/generate-llms.mjs`). Recipe: `/cf-pages-safe`.
 */

// vitest runs with cwd = apps/web (the package root), for both `pnpm --filter
// web` and the CI `turbo run test`.
const APP_DIR = join(process.cwd(), "app");

// `import ... from "node:fs"` / `require("node:path")`, plus bare Node builtins.
const NODE_BUILTIN_IMPORT =
  /(?:from|import|require\()\s*['"](?:node:[\w/]+|fs|fs\/promises|path|crypto|os|child_process|stream|zlib|http|https|net|tls|dns|worker_threads|module)['"]/;

async function findRouteHandlers(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findRouteHandlers(full)));
    } else if (/^route\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe("Cloudflare Pages safety (next-on-pages)", () => {
  it("no Route Handler imports a Node builtin", async () => {
    const handlers = await findRouteHandlers(APP_DIR);
    const offenders: string[] = [];
    for (const file of handlers) {
      const src = await readFile(file, "utf8");
      if (NODE_BUILTIN_IMPORT.test(src)) {
        offenders.push(file.slice(APP_DIR.length));
      }
    }
    expect(
      offenders,
      `These Route Handlers import a Node builtin and will break the Cloudflare Pages build ` +
        `(next-on-pages requires Route Handlers to run on the Edge runtime). Generate the output ` +
        `as a static asset at build instead — see scripts/generate-llms.mjs and /cf-pages-safe:\n` +
        offenders.map((f) => `  app/${f}`).join("\n"),
    ).toEqual([]);
  });
});
