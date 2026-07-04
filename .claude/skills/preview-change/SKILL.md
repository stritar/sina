---
name: preview-change
description: Preview a library (`packages/*`) change in the running playground/web without serving stale output. Use after editing `packages/core` (or `theme`/`fintech`) when "the change isn't showing up", before any visual verification in `apps/*`, or whenever an app renders an old icon/style/token despite a saved `src` edit.
---

> **Hardened on the CheckFat icon swap (Phase 2+).** The Select dropdown kept showing the old thin `Check` after `packages/core/src` was edited and unit-tested — because the playground serves the package's built `dist/`, which had not been rebuilt. This skill exists so a correct edit never *looks* broken again.

Apps consume the **built `dist/`** of every `@sina-design-system/*` package, not its `src`. So a source edit is invisible to a running app until `dist` is rebuilt. Since the Tailwind→CSS-Modules migration the build ships a `dist/styles.css` alongside `dist/*.js` (imported in each app's `app/layout.tsx`), so a **`*.module.css` edit is just as invisible until rebuilt** as a `.tsx` one. This skill makes sure what you verify is what you wrote.

## Why (the trap)

- Each library's `package.json` `exports`/`main` map points at `./dist/...` (see `packages/core/package.json`), so `import "@sina-design-system/core"` resolves to `dist`, never `src`.
- `apps/playground/next.config.mjs` lists the packages in `transpilePackages`, but that only *transpiles* the resolved files — it does **not** redirect resolution to source.
- Net effect: edit `src`, run unit tests (they import `src` directly so they pass), open the playground → you still see the **previous** `dist`. The edit looks like it "didn't work."

## Recipe

1. **Identify the edited package(s)** — e.g. `@sina-design-system/core` (and any of `theme` / `fintech` you touched).
2. **Refresh `dist` — pick one:**
   - **Iterative / multiple edits → root watch.** Run `pnpm dev` from the **repo root**. Turbo runs each library's `dev` (`vite build --watch`) alongside the app, so every save re-emits `dist/*.js` + `dist/styles.css` and the app hot-reloads. ⚠️ `pnpm --filter playground dev` *alone* watches only the app and will serve stale library output.
   - **One-off check → manual build.** `pnpm --filter <pkg> build` (e.g. `pnpm --filter @sina-design-system/core build` — Vite library mode + `tsc --emitDeclarationOnly`) before opening the app. Rebuild **every** edited library; upstream deps build first automatically where tasks `dependsOn: ["^build"]`.
3. **Confirm `dist` actually changed** before trusting the UI — for a `.tsx` change `grep -ric "<new symbol>" packages/<pkg>/dist/**` (e.g. `grep -ric CheckFat packages/core/dist/Select/Select.js`); for a `*.module.css` / token change `grep -c "<class-or-hex>" packages/<pkg>/dist/styles.css`.
4. **Verify in the app:** playground on **3001**, web on **3000**. Dev servers can't bind a port under the command sandbox (EPERM) — run them manually outside the sandbox. See [[playground-dev-sandbox-port]].

## Reuses

- Root `pnpm dev` → `turbo run dev` (persistent; per-package `vite build --watch`).
- Each library's `dev` / `build` scripts (`vite build --watch` for `dev`; `vite build && tsc --emitDeclarationOnly` for `build`, emitting `dist/*.js` + `dist/styles.css`).
- Binding rule in `CLAUDE.md` → **Commands** ("Apps consume built `dist/`, never `src`").
