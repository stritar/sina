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
 *
 * Three things are checked, because the failure mode is always the same — a green
 * `next build`, a red Cloudflare build, and a site frozen on yesterday's deploy:
 *
 *   1. No Route Handler imports a Node builtin.
 *   2. Every Route Handler declares its runtime — `dynamic = "force-static"` (emit a
 *      static asset at build) or `runtime = "edge"` (run in the worker). Forgetting
 *      is not a warning here; it aborts the build.
 *   3. `apps/web` contains no `"use server"` action, and no `ai` / `@ai-sdk/*`
 *      dependency. The playground's live mode needs a Node runtime and an API key;
 *      neither belongs on a public, statically-hosted docs site. The gate the docs
 *      demo runs is reached through `app/api/gate/route.ts` instead.
 */

// vitest runs with cwd = apps/web (the package root), for both `pnpm --filter
// web` and the CI `turbo run test`.
const APP_DIR = join(process.cwd(), "app");

// `import ... from "node:fs"` / `require("node:path")`, plus bare Node builtins.
const NODE_BUILTIN_IMPORT =
  /(?:from|import|require\()\s*['"](?:node:[\w/]+|fs|fs\/promises|path|crypto|os|child_process|stream|zlib|http|https|net|tls|dns|worker_threads|module)['"]/;

const FORCE_STATIC = /export\s+const\s+dynamic\s*=\s*['"]force-static['"]/;
const EDGE_RUNTIME = /export\s+const\s+runtime\s*=\s*['"]edge['"]/;
// fumadocs' search index: `staticGET` emits the handler's output as a build-time asset,
// so it's static by construction rather than by directive (see app/api/search/route.ts).
const STATIC_GET = /\bstaticGET\b/;
const USE_SERVER = /^\s*['"]use server['"]\s*;?/m;

const isRouteHandler = (name: string) => /^route\.(ts|tsx|js|mjs)$/.test(name);
const isSource = (name: string) => /\.(ts|tsx|js|mjs)$/.test(name) && !/\.test\./.test(name);

async function walk(dir: string, keep: (name: string) => boolean): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full, keep)));
    } else if (keep(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const rel = (file: string) => `app${file.slice(APP_DIR.length)}`;

describe("Cloudflare Pages safety (next-on-pages)", () => {
  it("no Route Handler imports a Node builtin", async () => {
    const handlers = await walk(APP_DIR, isRouteHandler);
    const offenders: string[] = [];
    for (const file of handlers) {
      const src = await readFile(file, "utf8");
      if (NODE_BUILTIN_IMPORT.test(src)) offenders.push(rel(file));
    }
    expect(
      offenders,
      `These Route Handlers import a Node builtin and will break the Cloudflare Pages build ` +
        `(next-on-pages requires Route Handlers to run on the Edge runtime). Generate the output ` +
        `as a static asset at build instead — see scripts/generate-llms.mjs and /cf-pages-safe:\n` +
        offenders.map((f) => `  ${f}`).join("\n"),
    ).toEqual([]);
  });

  it("every Route Handler is static or runs on the Edge runtime", async () => {
    const handlers = await walk(APP_DIR, isRouteHandler);
    const offenders: string[] = [];
    for (const file of handlers) {
      const src = await readFile(file, "utf8");
      const isStatic = FORCE_STATIC.test(src) || STATIC_GET.test(src);
      if (!isStatic && !EDGE_RUNTIME.test(src)) offenders.push(rel(file));
    }
    expect(
      offenders,
      `These Route Handlers are neither static (\`export const dynamic = "force-static"\`, or a ` +
        `\`staticGET\` that emits a build-time asset) nor \`export const runtime = "edge"\`. ` +
        `next-on-pages emits a function for every handler and REFUSES any that isn't Edge — the ` +
        `whole Pages build aborts and the live site silently keeps serving the previous deploy:\n` +
        offenders.map((f) => `  ${f}`).join("\n"),
    ).toEqual([]);
  });

  it("apps/web has no server action", async () => {
    const sources = await walk(APP_DIR, isSource);
    const offenders: string[] = [];
    for (const file of sources) {
      const src = await readFile(file, "utf8");
      if (USE_SERVER.test(src)) offenders.push(rel(file));
    }
    expect(
      offenders,
      `These files declare "use server". Cloudflare Pages cannot serve a server action from a ` +
        `statically exported page, and it is the path by which the playground's live mode (\`ai\`, ` +
        `ANTHROPIC_API_KEY) would leak into a public docs site. The docs reach the gate through ` +
        `the Edge Route Handler at app/api/gate/route.ts instead:\n` +
        offenders.map((f) => `  ${f}`).join("\n"),
    ).toEqual([]);
  });

  it("apps/web does not depend on a model SDK", async () => {
    const pkg = JSON.parse(await readFile(join(process.cwd(), "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const offenders = deps.filter((name) => name === "ai" || name.startsWith("@ai-sdk/"));
    expect(
      offenders,
      `The docs site must stay deterministic and secret-free: a real model call needs a Node ` +
        `runtime and an API key, and would make the demo non-reproducible. Live mode belongs to ` +
        `the playground. Offending dependencies: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});
