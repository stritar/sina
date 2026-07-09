---
name: cf-pages-safe
description: Keep `apps/web` Cloudflare-static-deployable (`@cloudflare/next-on-pages`) when adding or editing a route. Use before writing any `app/**/route.ts` (Route Handler), a page/route that reads files or uses `node:*` at request time, or when the Cloudflare `sina-docs` build fails, the docs go stale after a green push, or the `cf-pages-safe.test.ts` guard trips.
---

> **Hardened on the docs-deploy freeze (Phase 7 → 8, 2026-07-09).** The full docs set built green in `next build` locally and in CI for weeks, yet the live site was frozen on a *pre-docs* commit. Cause: `app/llms/[...slug]/route.ts` read `.mdx` with `node:fs` at request time. `@cloudflare/next-on-pages` rejected it, the **Cloudflare Pages build aborted**, and CF kept serving the last *successful* deploy — so a real regression looked like "nothing changed." This skill exists so a route edit can never silently un-deploy the site again.

`apps/web` deploys to Cloudflare Pages (project **`sina-docs`**) through **`@cloudflare/next-on-pages`**, which post-processes `next build` output into Cloudflare's static + Edge-worker format. Plain `next build` passing is **not** proof it deploys — next-on-pages is stricter. This skill is the pre-flight for any route change.

## The trap (why a green `next build` still breaks the deploy)

- next-on-pages emits a **runtime function for every Route Handler** (`app/**/route.ts`) — **even `export const dynamic = "force-static"`** ones. (Pages/`page.tsx` are treated differently: they only produce an "Invalid prerender config" *warning*, which next-on-pages handles. Route Handlers **error**.)
- Every such function **must run on the Edge runtime**. A handler that imports a **Node builtin** (`node:fs`, `node:path`, `node:crypto`, `node:os`, `child_process`, `stream`, `zlib`, …) can't be Edge — and Edge can't polyfill `node:fs` anyway — so next-on-pages fails the whole build with:
  ```
  ERROR: Failed to produce a Cloudflare Pages build from the project.
  The following routes were not configured to run with the Edge Runtime:
    - /llms/[...slug]
  ```
- **Cloudflare then serves the last successful deploy**, so the symptom is "my new docs/route isn't live" with a *green* GitHub CI — the failure is only visible in the **Cloudflare deployment build log**, never in GitHub Actions.

## Rules

1. **A Route Handler must never import a Node builtin or need the Node runtime.** No `node:fs`/`node:path`/`node:crypto`/etc. at request time.
2. **To serve file- or content-derived output, generate it as a static asset at build** — don't read at request time. The canonical fix is `apps/web/scripts/generate-llms.mjs`: it walks `content/docs/**` and writes `public/llms/docs/**.md`, wired into `prebuild` (and `predev`). Static files under `public/` need no function, so next-on-pages has nothing to reject.
3. **Prefer static generation over `runtime = "edge"`.** Edge works only if the handler is genuinely Edge-safe (no Node APIs). For content that lives on disk, static generation is simpler and keeps the whole site function-free.
4. **The real gate is `pages:build`, not `next build`.** Always verify with the command Cloudflare runs.

## Recipe (adding/editing an `apps/web` route)

1. **Is it a Route Handler (`route.ts`) that reads files or uses `node:*`?** If yes → do **not** read at request time. Add/extend a build-time generator (mirror `scripts/generate-llms.mjs`), write outputs into `public/…`, and wire it into `apps/web`'s `prebuild` (so `pnpm run build` — the command CF/vercel invoke — regenerates it) and `predev`. Delete the dynamic route; point any links at the static asset (note the file extension, e.g. `.md`).
2. **If it genuinely must run per-request**, it must be Edge: `export const runtime = "edge";` and use only Web/Edge APIs (`fetch`, Web Crypto) — no Node builtins.
3. **Run the real Cloudflare build** and confirm it *fully* succeeds — check the exit code and that `_worker.js` was produced (its absence means next-on-pages bailed):
   ```bash
   pnpm --filter web pages:build            # run sandbox-off; next build hangs under the sandbox
   echo "exit=$?"                           # MUST be 0 — a trailing `&&`/wrapper can mask a non-zero build
   ls -d apps/web/.vercel/output/static/_worker.js   # MUST exist
   ```
   ⚠️ Don't trust a wrapper's exit code (`cmd > log; echo EXIT=$?` reports the `echo`'s status). Read the tail of the log for `Failed to produce a Cloudflare Pages build`.
4. **Extend the guard** if you added a new class of route: `apps/web/app/cf-pages-safe.test.ts` fails the build if any Route Handler imports a Node builtin. Keep it green.

## Reuses

- `apps/web/scripts/generate-llms.mjs` — the build-time static-generation pattern (delete-the-route fix).
- `apps/web/app/cf-pages-safe.test.ts` — the vitest guard (runs under `pnpm test` + CI).
- `CLAUDE.md` → **Deployment** — the hard rule + the `sina-docs` Git-integration setup (Node 22 via `.node-version`; CF serves the last *successful* build).
- next build hangs under the command sandbox — run `pages:build` sandbox-off (see [[next-build-sandbox-hang]]).
