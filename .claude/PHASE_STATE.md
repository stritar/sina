# SINA — Phase State

**Single source of truth for phase progress.** Read this to know where we are; do **not** re-audit the repo. Update **only** via the `/phase-status` skill, which re-runs a phase's verification before flipping it to `done`.

See `ROADMAP.md` for the full definition of each phase and its exit criteria.

| Phase | Status | Completed | Verified by |
|---|---|---|---|
| 0 — Foundation Audit & Wiring | done | 2026-06-26 | `pnpm build && pnpm typecheck && pnpm lint` green; theme preset wired in both apps; boundaries enforced via per-package ESLint `no-restricted-imports`; vitest + jest-axe smoke tests pass |
| 0.5 — Agentic Workflow Setup | done | 2026-06-26 | `pnpm build && pnpm typecheck && pnpm lint && pnpm test` all green; `CLAUDE.md` + 5 skills + post-edit hook landed; hook verified to exit 2 on a React-in-theme boundary probe and skip non-source files |
| 1 — Theme & Design Tokens | done | 2026-06-26 | `pnpm build && pnpm typecheck && pnpm lint && pnpm test` all green; tokens land in `packages/theme/theme.css` (`--sina-*` CSS vars) + Tailwind preset (strict override, alpha-aware colors), consumed by both apps; drift + WCAG 2.2 AA contrast tests pass (`pnpm --filter @sina-design-system/theme test`) |
| 2 — Core Primitives | done | 2026-06-30 | `pnpm build && pnpm typecheck && pnpm lint` all green (28 playground primitive routes build clean); `pnpm --filter @sina-design-system/core test` (60 passed / 26 files) + `pnpm --filter @sina-design-system/theme test` (11 passed); micro-grid spacing tokens + off-grid guard `offgrid-utilities.test.ts` in place; Figma hand-off regenerated → file `kRTCdsBg4WpiGxQQGfvoLU` (see [[sina-figma-file]]). NB `pnpm test` aggregate has a pre-existing turbo/vitest concurrency flake ("no tests"), unrelated. |
| 3 — Zod Constitution (governance + fintech) | done | 2026-06-30 | `CI=true pnpm build && pnpm typecheck && pnpm lint` all green (12/12 tasks); `pnpm --filter @sina-design-system/governance test` (9 passed) + `@sina-design-system/fintech test` (29 passed); aggregate `pnpm test` 12/12 (governance 9 / fintech 29 / core 60 / theme 11) — run sandbox-off (vitest `/tmp` mkdir EPERM under sandbox). New `packages/governance` = the shared seam: interception contract `{valid,violations,requiredComponent}` + `intercept` engine (reject/escalate/flag) + redacting audit emit. `packages/fintech` = wire-transfer constitution: cited `thresholds.ts` (FinCEN CTR/Travel Rule/SAR + $50k approval), reusable cited format primitives (ISO 4217 minor-units, IBAN mod-97, BIC, ABA, Luhn), `.strict()` payload + `wirePolicy` + valid/adversarial fixtures; every decision emits an audit event. `/new-schema` skill hardened. NB pnpm needs `CI=true` (no-TTY purge). |
| 4 — Playground Test Bed (AI SDK) | done | 2026-07-01 | `CI=true pnpm build` (7/7) + `pnpm typecheck` (12/12) + `pnpm lint` (12/12) all green; `pnpm --filter playground test` 9/9 (5 gate + 4 jest-axe, zero violations); `next build` 28 routes. Design review resolved + Figma component-ization complete: Emulator page `65:2` rebuilt entirely from real bound instances — heroes Light `65:3` / Dark `96:1301` + governed-pass `97:595` + Coverage `99:795`; 6 emulator component sets (ServerBoundary/DecisionSummary/ConsoleStage/ModeToggle/Composer/ChatTurn) + 5 glyphs; composer full-width + real "governed by SINA" Badge + corrected 3 violations. Code composer-clip + block-the-stream motion synced. See [[sina-figma-file]]. Run tests `CI=true` + sandbox-off. |
| 5 — Governed Fintech Components | done | 2026-07-01 | `CI=true pnpm build` (8/8) + `typecheck` (14/14) + `lint` (14/14, `fintech-react` boundary enforced) all green; tests: fintech 37 (+8 secondary-approval), fintech-react 3 (jest-axe zero violations across dialog states), playground 12 (8 gate incl. approved/self-approval/mismatch + 4 a11y), core 60 / governance 9 / theme 18. New `@sina-design-system/fintech-react` (the governed-UI third layer) houses `SecureWireDialog`; `fintech` gained the server-side approval extension (`formats/canonical.ts` binding hash, `ApprovalContext` initiator **server-supplied**, `makeWirePolicy` payload-binding + four-eyes, v1.0.0→1.1.0). Runtime smoke vs built dist: over-limit→forces `SecureWireDialog`, cross-manager approve→valid, self-approval→`SELF_APPROVAL_FORBIDDEN`, approve-$5k-exec-$60k→`APPROVAL_PAYLOAD_MISMATCH`. `/new-governed-component` skill + CLAUDE.md boundary landed. Gaps: replay/staleness (`challengeId` reserved, P10), identity/session. Run tests `CI=true` + sandbox-off. |
| 6 — Agentic Fintech Experience (Governed + Ungoverned) | done | 2026-07-03 | `CI=true pnpm build` (8/8) + `typecheck` (14/14) + `lint` (14/14) green; tests 14/14 (sandbox-off) — core 65 / governance 18 / theme 18 / fintech 132 / fintech-react 85 / playground 109. Full workstream A–F surface landed (see below). |
| 6.5 — Full Fintech Pattern Catalog (agent-executed) | done | 2026-07-03 | Whole `PATTERNS.md` catalog ✅: 17 new ungoverned reads + 20 new governed flows, each with schema + fixtures + registry entry + green gate test + playground scenario (reads also jest-axe). Fanned out via a Workflow (36 agents), assembled + verified centrally. Same green commands as Phase 6. |
| 7 — Documentation (Fumadocs) | done | 2026-07-09 | `CI=true pnpm --config.verify-deps-before-run=false typecheck` (16/16) + `lint` (16/16) + `test` (16/16 tasks; core 106 / fintech-react 100 / web docs-chrome incl. ThemeToggle + nested sidebar) all green; `apps/web` next build (sandbox-off) → **45 static pages**: `/` + `/api/search` + `/llms.txt` Static, `/docs` Static, `/docs/[...slug]` SSG (19 pages), `/llms/[...slug]` SSG (19). Full 6-section IA + dark-mode toggle + dual-theme shiki + llms.txt/per-page `.md` export landed. **Deploy LIVE on Cloudflare Pages** (`sina-docs`, auto on push to `main`; see 2026-07-09 deploy close-out below); TSDoc auto-gen deferred to P10. See detail below. |
| 8 — npm Publish Pipeline | done | 2026-07-09 | **First real publish shipped.** changesets + CI/release workflows + per-package README/LICENSE/metadata; `publint`/`attw` clean ×5; the changesets Version PR merged → `release.yml` ran `changeset publish`. Verified live: `npm view @sina-design-system/{theme,core,governance,fintech,fintech-react} version` → all **0.1.0** (`latest`; core's old manual 0.0.7 superseded). Provenance off (private repo). See close-out below. |
| 8.5 — Documentation UX (ground-up rewrite) | done | 2026-07-09 | User-directed full rewrite of `apps/web/content/docs/**`: governance-first IA, ~75 tight pages, a **17-component reusable visual/diagram kit** (`app/components/docs/visuals/*`, axe-tested), cited-standards page + compliance disclaimer, `public/_redirects` for moved URLs; retired `architecture/`+`components/`. Verified GREEN (sandbox-off; tools via `node` not `pnpm exec`): clean `next build` → 74 docs pages SSG + routes; web vitest 7/7 (docs-chrome axe + cf-pages-safe); tsc + eslint clean; 75/75 internal links resolve. Exceeds the original content-only scope. See 8.5 close-out below. **Addendum (same day): docs consolidation + live primitives gallery** — 78 pages → 18 prose pages + 29-page shadcn-style primitives section (live code-split demos), 4 anti-bloat guard tests + 2 skills, redirects moved to `redirects.mjs`/`next.config` (the `public/_redirects` rules had NEVER fired in production — worker handles all paths). Verified: workspace 16/16 typecheck/lint/test (web 129 tests), `next build` 54 static pages, `pages:build` + wrangler smoke → old URLs 308 to final destinations. See consolidation close-out below. |
| 9 — Marketing Site | in-progress | — | Wireframe milestone landed 2026-07-17 (see Phase 9 section below); `done` awaits the fidelity pass + design sign-off |
| 10 — Release Hardening | not-started | — | — |
| 11 — Governance Coverage Expansion (fintech gap-closing) | not-started | — | — |

**Status values:** `not-started` · `in-progress` · `blocked` · `done`.

---

## Phase 9 — IN PROGRESS: wireframe landing milestone (2026-07-17)

Full plan: `lets-kick-off-phase-partitioned-pebble.md`. User-directed **wireframe-first** kickoff: the real landing shipped at LOW fidelity by design (black/gray/white); a later fidelity pass re-skins it in place.

**DONE & verified GREEN (do not redo):**
- **Bespoke landing** replaces the placeholder at `apps/web/app/(marketing)/` — nav / hero / emulator / how-it-works / why-cards / final CTA / footer, all CSS Modules over `--sina-*`. `MarketingHome({locale})` contract preserved (the 5 locale homes render it via `app/[...path]`; English-only copy inline in `landing/copy.ts` for now — catalogs at the fidelity pass).
- **Wireframe skin** = tier-1 token override in `(marketing)/wireframe.css`, scoped `body:has(.sina-wireframe)` (portals + body bg included), light + inverted-dark variants, AA by construction. Scope lives on `MarketingHome`, NOT the (marketing) layout (locale homes bypass that layout). Status fills stay light in both modes (black ink AA); severity rides on glyph + revealed status borders, not hue.
- **Industry-switching emulator** (`landing/Emulator.tsx` + `landing/emulator/*`): fieldset-radio industry switcher (fintech / healthcare / defense; the latter two show a hero "Coming soon" Badge), 3-stage loop (intent → gate → verdict), per-industry scenario chips. **Fintech hits the REAL `/api/gate`** (catalog ids only: over-limit default / small / list-transactions / fabricated-confirm; type-only imports from `governance-demo/server` so the console stays out of the bundle — `/` first-load 158 kB vs 335 kB docs). **Healthcare/defense are canned browser sims** (`simulated.ts`, no Zod, NO new industry packages — avoids the standards-catalog rule) with a persistent "Simulated preview" label. Blocked verdict = BlockedState pattern (text-only danger Alert + sibling Badges). Transport failure renders as warning, distinct from a block. Reduced-motion collapses artificial delays; hidden `role="status"` narrates runs.
- **Guards:** `docs-prose.test.ts` now walks ALL of `app/(marketing)/**/*.{ts,tsx}` (tests excluded) + non-vacuous count; new `landing/landing.test.tsx` (8 tests: axe on idle/pass/escalate/reject/transport/sim states, coming-soon toggle, no-nested-status assertion, scenario-id-only wire assertion). cf-pages-safe untouched and green (no new handlers, no `"use server"`).
- **Decisions (user):** npm org link (`npmjs.com/org/sina-design-system`) instead of GitHub (repo private → would 404); inverted dark wireframe; CF Web Analytics = user dashboard step; English-only copy this pass.
- **Verified (sandbox-off where noted):** web vitest 10 files / 713 tests green; `tsc --noEmit` + eslint clean; clean `next build` → `/` Static (312 pages, locale homes intact, `/api/gate` the only edge fn); `next-on-pages` green; wrangler smoke → `/` 200 with landing markers, POST `/api/gate` over-limit returns the real escalation trace, `/es` renders the landing. Stale-`.next` `/_document` error reproduced once → fixed by clean build (known gotcha).
- **Comment-only:** `governance-demo/src/index.ts` header updated (landing deviates in presentation only; same real gate).

**REMAINING for Phase 9 done:** fidelity pass (real brand skin), copy → i18n catalogs + 5 translations, design sign-off, optional Figma mirror, user enables CF Web Analytics on `sina-docs`.

---

## Phase 7 — DONE: full docs (content + polish) (2026-07-09)

Full plan: `kickoff-phase-7-binary-russell.md` (foundation) + `ok-lets-wrap-up-serialized-dragon.md` (this close-out). The foundation + vertical slice landed 2026-07-06; the content + polish close-out landed 2026-07-09. See [[phase7-docs-fumadocs-headless]].

**Decision (with the user):** docs use **headless `fumadocs-core` ONLY — no `fumadocs-ui`, no Tailwind** (fumadocs-ui hard-couples to Tailwind v4; the repo removed Tailwind). All docs chrome is hand-built from SINA `core` primitives + `--sina-*` CSS Modules. **The ROADMAP §Phase-7 "compose Tailwind presets / map `--color-fd-*`" language is superseded — ignore it.**

**DONE & verified GREEN (do not redo):**
- **`apps/web` docs engine (headless):** `fumadocs-core@15.8.5` + `fumadocs-mdx@14.2.13` (NOT the 15.x mdx line — it forces Next 16); `next` bumped `^15.1.4`→`^15.3.0` monorepo-wide. `source.config.ts` + `lib/source.ts` (collection imported from **`@/.source/server`**) + `next.config` `createMDX()` + `postinstall: fumadocs-mdx`. Catch-all `app/docs/[[...slug]]/page.tsx` (`dynamicParams=false`, `generateStaticParams`, headless `page.data.body` render) + `app/docs/layout.tsx`.
- **Custom chrome (CSS Modules over `--sina-*`):** `app/components/docs/` — `DocsShell`, `DocsHeader` (mobile Dialog drawer), `Sidebar` (page tree + `aria-current`), `DocsTOC` (`fumadocs-core/toc` scroll-spy), `CodePre` (copy button over shiki `<pre>`), `Search` (`useDocsSearch({type:'static'})` in a `core` Dialog), `mdx-components` + `.prose` typography. jest-axe chrome test.
- **Static search:** `app/api/search/route.ts` = `createFromSource(source, {buildIndex})` + `revalidate=false` (explicit `buildIndex` — the v14 server runtime doesn't surface `structuredData` at static export). Cloudflare-static-safe.
- **3 MDX pages:** Introduction · The One Invariant (§1b, embeds the demo) · The Interception Contract. Marketing home moved into a reserved **`(marketing)` route group** for Phase 9.
- **New `@sina-design-system/governance-demo`** (`private`, Vite-lib build like fintech-react): the deterministic **LLM-free** gate + read-only interception console, **extracted from the playground** (pure `gate`/`scenarios`/`types`/`format` + presentational `ConsoleTimeline`/`ComparisonToggle`/`GovernedWireSummary`/… ). New **`GovernanceDemo` RSC** runs `runGate` at build (SSG) — honors §1b with no `"use server"`/edge. The AI-SDK/`gateLive`, `regate*`, registry, interactive `*Host`/shell **stay in the playground** (re-pointed to import the package). Embedded via `<GovernanceDemo scenario="over-limit" />` in `the-one-invariant.mdx`.
- **Cloudflare pipeline stood up:** `apps/web/wrangler.toml` (`nodejs_compat`), `.gitignore` (`.vercel`, `.source`), `pages:build`/`pages:preview` scripts. Local preview is user-run (sandbox can't bind ports; `wrangler pages dev` needs the `workerd` build script approved). **The production deploy is now automated — see the deploy close-out below.**
- **Verified:** typecheck 16/16, lint 16/16, `pnpm test` exit 0 (governance-demo 107 = 105 gate + 2 embed a11y; playground 4 a11y; web 3 chrome a11y; rest unchanged); `apps/web` next build → `/` + `/api/search` **Static**, `/docs/*` **SSG** (3 pages); playground next build green. **Run pnpm scripts with `CI=true --config.verify-deps-before-run=false`; `next build` must run sandbox-off** (webpack cache hangs under sandbox — see [[next-build-sandbox-hang]]).

**CLOSE-OUT (2026-07-09) — DONE & verified GREEN (do not redo):**
- **Full 6-section IA** (`content/docs/` now folders + per-section `meta.json`, root order in `content/docs/meta.json`): Getting Started (Introduction=`index.mdx` · The One Invariant · Quickstart) · Concepts (threat-model · interception-contract · audit-trail · modes) · Architecture (three-layers · package-boundaries · interception-seam) · Guides (add-a-governed-domain · theme-the-primitives · add-a-primitive · add-a-schema · adversarial-test) · Reference (theme · core · fintech · governance, **hand-written** w/ a "TSDoc auto-gen deferred to P10" note) · Components (`index.mdx` w/ live demos). The two old flat root pages moved into folders; internal links repointed to nested paths.
- **Live Components demos:** `app/components/docs/demos/PrimitiveDemos.tsx` (`"use client"`) — DialogDemo/CurrencyFieldDemo/GridDemo import real `core` primitives; registered in `mdx-components.tsx`. SecureWireDialog is shown via `<GovernanceDemo scenario="over-limit" />` (no fintech-react dep added to web).
- **Dark-mode toggle:** `ThemeToggle.tsx` stamps `data-theme` on `<html>` + persists to localStorage; no-FOUC inline script + `suppressHydrationWarning` in `app/layout.tsx`. The `theme` package's `[data-theme="dark"]` block re-colors everything.
- **Token-driven dual-theme shiki:** `source.config.ts` `mdxOptions.rehypeCodeOptions.themes = {light: github-light, dark: github-dark}`; `globals.css` flips `--shiki-light`/`--shiki-dark` on `[data-theme="dark"]` (code-block bg stays a SINA surface token).
- **`llms.txt` + per-page `.md`:** `app/llms.txt/route.ts` (force-static index) + `app/llms/[...slug]/route.ts` (per-page raw markdown read from the content tree via fs; `dynamic=force-static`, `dynamicParams=false`, generateStaticParams mirrors the doc URLs under `/llms/docs/...`).
- **a11y:** `docs-chrome.test.tsx` extended — nested folder tree in the Sidebar + a `ThemeToggle` axe case; all green.
- **Verified:** typecheck 16/16, lint 16/16, test 16/16 tasks; `apps/web` next build (sandbox-off) → **45 static pages** (`/`, `/api/search`, `/llms.txt` Static; `/docs` Static; `/docs/[...slug]` SSG 19; `/llms/[...slug]` SSG 19). Run pnpm `CI=true --config.verify-deps-before-run=false`; next build sandbox-off ([[next-build-sandbox-hang]]).

**STILL DEFERRED (moved to Phase 10):** auto-generated API reference (TSDoc→MDX).

### Deploy close-out (2026-07-09) — docs LIVE on Cloudflare Pages

The docs are published automatically; **no manual `wrangler pages deploy` step remains**.

- **How it deploys:** a Cloudflare Pages **Git integration** (project **`sina-docs`**; domains `sinahub.app` + `sina-28u.pages.dev`) builds every push to `main` (build cmd `pnpm --filter web pages:build`, output `apps/web/.vercel/output/static`) and publishes on success. There is **no** deploy step in GitHub Actions. Node is pinned by **`.node-version` = 22**. CF serialises deployments and serves the **last *successful*** build, so a stale live site after a green push = the CF build **failed** (read the CF deployment log, not GitHub).
- **The bug that had frozen it:** the docs commit added `app/llms/[...slug]/route.ts`, a Route Handler that read `.mdx` with `node:fs` at request time. `@cloudflare/next-on-pages` emits an Edge function for every Route Handler and rejects Node builtins → the CF build aborted while `next build` stayed green, so CF kept serving a pre-docs commit. Also, pnpm 11.9.0 needs Node ≥ 22.13 but CI/Release were on Node 20 (`node:sqlite` crash).
- **Fix (shipped `614a700`/`1d620fa`):** replaced the route with a build-time static generator `apps/web/scripts/generate-llms.mjs` (raw md → `public/llms/docs/**.md`, wired into `prebuild`/`predev`; llms.txt links now `.md`); Node → 22 in `ci.yml`/`release.yml` + new `.node-version` + `engines.node >=22.13`. `pages:build` now exits 0 and emits `_worker.js`.
- **Prevention (do not remove):** guard `apps/web/app/cf-pages-safe.test.ts` (fails if any Route Handler imports a Node builtin), skill **`/cf-pages-safe`**, and the **Deployment** section in `CLAUDE.md` (the hard rule + the `sina-docs` setup). See [[cloudflare-docs-deploy]].

---

## Phase 8 — IN PROGRESS: npm publish pipeline scaffolded (2026-07-09)

Full plan: `ok-lets-wrap-up-serialized-dragon.md`. The pipeline is **ready to publish**; the first real publish is a user step. See [[pnpm-verify-deps-purge]] / [[pnpm-install-sandbox-corruption]] for the sandbox-off install caveats.

**DONE & verified GREEN (do not redo):**
- **Changesets:** root `@changesets/cli` + `.changeset/config.json` (`access: public`, `baseBranch: main`, empty `ignore` — private packages auto-excluded) + `.changeset/initial-public-release.md` (5 public packages → **minor**, 0.0.0→0.1.0, left unconsumed so the maintainer/CI runs `version`). Root scripts: `changeset`, `version-packages` (NOT `version` — avoids the npm/pnpm `version` lifecycle footgun), `release` (`turbo build packages && changeset publish`), `publint`.
- **Package metadata (5 public):** each gained `author`/`keywords`/`homepage`/`bugs`/`repository`+`directory` + a `README.md` + a `LICENSE` (copied from root MIT). `description`/`publishConfig.access:public`/`files` were already present.
- **CI:** `.github/workflows/ci.yml` (build/typecheck/lint/test + publint on PR + push to main) and `release.yml` (changesets action: Version PR → publish on merge; `NPM_TOKEN` + `NPM_CONFIG_PROVENANCE=true` + `id-token: write`).
- **Publishability validated (no publish):** dependency-classification audit clean (every runtime import — phosphor/chart.js/clsx/radix-ui/zod/workspace deps — is a declared `dependency`; react/react-dom are peers); `publint` clean ×5; `attw` clean ×5 for the `.` entry across node10/node16/bundler (CSS subpath exports excluded — attw can't resolve CSS, publint validates them; `cjs-resolves-to-esm` ignored since packages are intentionally ESM-only); `pnpm publish -r --dry-run --no-git-checks` publishes **exactly** the 5 public packages (config + governance-demo skipped as private); tarballs = `dist` + `README` + `LICENSE`, **no `src`**.
- **Toolchain note:** `attw@0.17` crashes on Node 26 ("reading 'filename'"); bumped to `@arethetypeswrong/cli@^0.18.2`. Install ran sandbox-off (`CI=true pnpm install --no-frozen-lockfile`).

**OPEN (user steps — not blocking the phase scaffolding):** own/create the `@sina-design-system` npm org; add the `NPM_TOKEN` repo secret; run the first real publish (npm login + 2FA) — merging the changesets Version PR on `main` triggers `release.yml`.

**Re-validated 2026-07-09:** fixed `release.yml`'s Node-20 `node:sqlite` crash (→ Node 22, shared with the Cloudflare fix); re-ran build-all + `pnpm publish -r --dry-run --no-git-checks` → still publishes exactly the 5 public packages (config + governance-demo skipped). Pipeline unchanged and green.

**PUBLISH CLOSE-OUT (2026-07-09) — DONE, all 5 packages live at 0.1.0:**
- **Provenance off:** `stritar/sina` is **private** and npm provenance needs a public repo, so `NPM_CONFIG_PROVENANCE` + `id-token: write` were removed from `release.yml` (commit `e312617`). Re-add both if the repo goes public. See [[npm-publish-pipeline]].
- **Token:** a **granular** npm token — Read **and** write on the `@sina-design-system` scope, Organizations: No access — stored as the `NPM_TOKEN` repo secret.
- **Two GitHub gotchas the user cleared:** (1) the Node-20 crash (fixed to Node 22); (2) Release failed opening the Version PR with *"GitHub Actions is not permitted to create or approve pull requests"* → enable **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"** (+ Read and write permissions).
- **Flow that worked:** push → Release opens the "Version Packages" PR (0.0.0→0.1.0) → **merge it** → Release runs `changeset publish`. `core` already existed on npm at a manual `0.0.7`; `0.1.0 > 0.0.7` so it published cleanly and `latest` moved to 0.1.0 with the correct new metadata.
- **Future releases:** `pnpm changeset` → merge to `main` → merge the auto-opened Version PR.

---

## Phase 8.5 — DONE: ground-up documentation rewrite (2026-07-09)

Full plan: `lets-kick-off-phase-parallel-dolphin.md`. User-directed to exceed the original "content-only" scope: a from-first-principles rewrite with a **governance-first spine**, a **reusable visual kit**, cited standards, and full content — grounded in live research of ~20 best-in-class doc sites (Stripe, Vercel, Next.js, Radix, shadcn, OPA, Sentinel, …).

**DONE & verified GREEN (do not redo):**
- **Visual kit — 17 MDX components** under `apps/web/app/components/docs/visuals/*`: Callout, Card/CardGrid, Steps, DoDont, DeepDive, Tabs, Props/Keyboard/DataAttr tables, TokenSwatch, YouWillLearn/Recap, Compliance/Prereqs/A11yBar partials, and 6 hand-authored SVG diagrams (FlowDiagram, ArchitectureDiagram, EnforcementLadder, TokenTree, PrimitiveAnatomy, BeforeAfter). All static/SSG, CSS Modules over `--sina-*` (no raw color), **self-contained inline SVG (no phosphor dep → CF-safe)**, axe-passing. Registered via `import * as visuals` in `mdx-components.tsx`; `docs-chrome.test.tsx` extended (full-kit axe case + Tabs a11y).
- **~75 pages across a new IA** (`content/docs/**` + 10 `meta.json`): Introduction · Getting started (why-sina [merges "how it's different"] · how-sina-works · quickstart · choose-your-path) · Core concepts (7) · AI agents (3) · Governance in practice (7 — incl. **standards** + **security** + the **wire-transfer** centerpiece) · Primitives (gallery + 29) · Tokens (3) · Theming (2) · Guides (9) · Reference (9 — incl. glossary/faq/intent-registry/docs-for-agents/changelog). The **$60k wire** is the running example throughout; jargon defined-on-first-use; "keep it lean" budgets applied.
- **Migration:** retired `architecture/` + `components/` + the old flat concept pages; `public/_redirects` maps every moved URL (301). `generate-llms.mjs` re-emits 74 per-page `.md` + `llms.txt`. All 75 internal links resolve (checked).
- **Gotchas hardened (do not repeat):** the fumadocs 15.8.5 `"---Foundations---"` **separator in root `meta.json` deterministically breaks `next build` data-collection** (`PageNotFoundError: /_document`) — dropped it; Primitives/Tokens/Theming stand as top-level sections. The **same `/_document` error also comes from a stale `.next` cache** on incremental builds — a clean `rm -rf .next` build is the reliable signal. **Run docs tools via `node node_modules/...` directly** — `pnpm --filter web exec/run` triggers the verify-deps **modules-purge**; recover with nuke-`node_modules` + reinstall (see [[pnpm-verify-deps-purge]] / [[pnpm-install-sandbox-corruption]]). `next build` must run **cwd=apps/web** (fumadocs `source.config.ts`) and **sandbox-off**.
- **Verified GREEN (sandbox-off):** clean `next build` → 74 docs pages SSG + `/`,`/docs`,`/api/search`,`/llms.txt`; web vitest 7/7; `tsc --noEmit` clean; eslint clean; 75/75 internal links. **On-screen content review + local `wrangler pages dev` preview are the user's step.** Deploys automatically on push to `main` via the `sina-docs` CF Pages integration ([[cloudflare-docs-deploy]]).

---

## Phase 8.5 addendum — DONE: docs consolidation + live primitives gallery (2026-07-09)

User-directed follow-up to the 8.5 rewrite (it read as bloated/repetitive): tell the core story ONCE, in minimum words, for technical and non-technical readers; give primitives a shadcn-style section with live demos; add durable anti-bloat enforcement.

**DONE & verified GREEN (do not redo):**
- **Prose: 47 pages → 18** (~19k → ~9k words total; the gate story told once). New IA: index (value prop + who it's for) · how-it-works · quickstart · concepts/{the-contract, escalation, audit-trail} · governance/{index, wire-transfer, writing-a-rule, components-and-patterns} · agents · theming/{index, tokens} · guides/{adopt-incrementally, extend-sina} · reference/{packages, glossary (＋FAQ), changelog}. Deleted folders: `getting-started/`, `ai/`, `tokens/`. Canonical-asset homes: FlowDiagram→index, ArchitectureDiagram→how-it-works, EnforcementLadder→concepts/escalation, TokenTree→theming/tokens, GovernanceDemo→{quickstart, agents, governance/wire-transfer} only. Diagram copy reworked to the concrete $60k scenario (pass + fail paths, plain words).
- **Primitives: 29 shadcn-style pages + visual gallery.** Per page: live hero → Usage → Preview/Code `Example`s (+ `Matrix` grids) → PropsTable → A11y, ≤250 prose words. Demo modules at `app/components/docs/demos/primitives/<slug>.tsx` (`"use client"`, ported from playground stories), imported **directly by the MDX** → code-split per page (Chart.js ships only on chart pages; verified). Shared shell `demos/shell.tsx` (Hero/Demo/Specimen/Matrix/Example/StorySource). Gallery index = `gallery.tsx`, 29 cards with inert live specimens. **Gotcha:** a demo file named `icon.tsx` under `app/**` trips Next's icon metadata route and kills the build → `icon-demo.tsx`.
- **Docs UX chrome:** `DocsPager` (prev/next via `findNeighbour`), `CopyMarkdown` ("Copy for LLM", raw `.md` per page incl. root via `generate-llms.mjs`), `<Term>` glossary tooltips (visuals kit), `StorySource` playground links (GitHub until the playground deploys).
- **Redirects — CRITICAL FIX:** `public/_redirects` **never worked in production** — next-on-pages' `_routes.json` includes `/*` so the worker handles every path, and Cloudflare skips `_redirects` for worker requests (the 8.5 rules 404'd live; verified `curl sinahub.app/docs/components` → 404). Replaced with `apps/web/redirects.mjs` → `next.config.mjs` `redirects()` (compiled into the worker). 46 flat rules; verified via `wrangler pages dev` smoke → 308s to final destinations.
- **Anti-bloat enforcement (rule + guard + skill triad ×2):** CLAUDE.md rules "Docs stay small" + "Every core primitive has a live docs page"; guards `apps/web/content/docs-{canon,budget,links}.test.ts` + `primitive-docs.test.ts` (slugs derived from core exports; budgets ≤20 prose pages / ≤700 words with `wordBudget` frontmatter override; canon single-home; link+redirect integrity incl. loop/shadow checks); skills `/new-doc-page` + `/new-primitive-doc`.
- **Verified:** workspace `CI=true` typecheck/lint/test 16/16 (web vitest 129); clean `next build` (cwd=apps/web, sandbox-off) → 54 static pages, 48 llms `.md`; `pages:build` green; wrangler redirect smoke (8 old URLs → 308 correct target, live pages 200); built HTML spot-checks (pager, copy button, gallery links, live hero SSG'd).

---

## Chart primitives workstream — DONE (2026-07-04)

Full Chart.js chart primitives recreated from the remarkable-sandbox reference (plan
`we-currently-have-charts-sleepy-pumpkin.md`), extending the Phase-2 core surface while Phase 7 stays the frontier.

**DONE & verified GREEN (do not redo):**
- **`core` gains 5 primitives:** `LineChart` (line/area via `fill`), `BarChart` (horizontal × stacked), `PieChart` +
  `DonutChart` (cutout + DOM-overlay center label), `KpiStat` (server-mountable stat tile, no `"use client"`, cva
  `size`). Canvas charts: chart.js ^4.5 + react-chartjs-2 ^5.3 (**new core deps** + `vitest-canvas-mock` devDep),
  `"use client"`, wrapper `role="img"` + required `label` (canvas `aria-hidden`), built-in Chart.js tooltip styled
  as an inverse token chip, hover emphasis, `prefers-reduced-motion` → `animation:false`, `valueFormatter` hook
  (keeps core domain-agnostic), `onElementClick` documented mouse-only. Shared infra `core/src/charts/` (internal):
  element-scoped `getComputedStyle` token readers (rem→px), option builders, palette/colorizers, `deepMerge`,
  `useChartTheme` MutationObserver re-render on `.dark`/`data-theme` flips. SSR-safe (options build after mount).
  The Phase-6 SVG sparkline `Chart` is **untouched**.
- **`theme` gains the dataviz palette:** `--sina-color-chart--1..8` (light + dark literal hexes) — derived from the
  SINA ramps (chroma-lifted where a ramp step reads gray) + 3 new hues (violet/plum/teal); slot order is the
  CVD-safety mechanism (validated Machado-2009, worst adjacent ΔE 56/51; all slots ≥3:1 on `surface`, steps distinct
  from status roles). Wired through `tailwind.cjs` (`text-chart-1`…), `tokens.ts` + `create-theme.ts`
  (**brand-open**; partition test), and `tokens.test.ts` chart-contrast guards.
- **Playground:** 5 stories (`line-chart`, `bar-chart`, `pie-chart`, `donut-chart`, `kpi-stat`) + PRIMITIVES rows —
  palette wrap (9 series), log scale, negative-value zero-line, orientation×stacked, donut center label, KPI state
  matrix, scoped-`.dark` demos (element-scoped token reads make these work).
- **Figma synced** (file `kRTCdsBg4WpiGxQQGfvoLU`, see [[sina-figma-file]]): Color collection gained `chart-1..8`
  (Light+Dark); 4 new pages — LineChart `156:10` (set `158:27`), BarChart `156:11` (set `158:140`),
  PieChart & Donut `156:12` (comps `157:1867`/`158:141`), KpiStat `156:13` (set `158:179`) — each with variant
  matrix + booleans/TEXT props + States/Coverage frames; `/primitive-figma-sync` mapping table updated.
- **Verified:** `CI=true pnpm build` (8/8) + `typecheck` (14/14) + `lint` (14/14) + `pnpm test` (14/14 tasks;
  core 95 incl. canvas-mocked chart tests + charts unit suite, theme 26 incl. palette contrast) — sandbox-off;
  `pnpm --filter playground build` (33 routes incl. the 5 new, all prerender) + prod-serve smoke (5× HTTP 200).
- **Gotchas hardened:** vitest-canvas-mock works under globals-off; `h-64`-style examples in core JSDoc trip the
  off-grid guard (scanner reads comments); Chart.js needs per-test ResizeObserver stubs.
- **Follow-ups (not blocking):** `showValueLabels` via chartjs-plugin-datalabels slots in non-breaking; a
  multi-series `LineChart` showcase (portfolio vs benchmark) is still unbuilt; browser tooltip-hover check
  still pending (only prerender/test ran).

**Update (2026-07-05) — `fintech-react` now consumes the Chart.js primitives** (resolves the "nothing consumes
the new charts yet" follow-up). Five display components upgraded, **schemas/fixtures/scenarios unchanged**:
`BalanceTrend` + `AssetDetail` → `LineChart` (BalanceTrend adds a `KpiStat` header), `CashflowSummary` →
`BarChart`, `SpendingBreakdown` → `PieChart`, `PortfolioHoldings` → `DonutChart`. Each keeps its text
summary/legend as the accessible path (chart is enhancement, not sole path) and became `"use client"` (passes a
`valueFormatter` function to the client chart). Also fixed: `charts/options.ts` no longer sets `beginAtZero` on a
logarithmic value axis; `vitest-canvas-mock` + a ResizeObserver stub added to the `fintech-react` and `playground`
test envs. **Verified green (sandbox-off):** `core` build (37 `.d.ts`) · `fintech-react` build/lint/typecheck/test
(96) · `playground` typecheck/test (109)/build.

---

## Phase 6 + 6.5 — DONE: full fintech catalog (2026-07-03)

Full workstream A–F surface + the entire `PATTERNS.md` catalog landed. Method: build the shared
foundations inline + verify, then fan out the mechanical per-pattern work as a **Workflow** (36
agents, isolated files only), then assemble the shared barrels deterministically and verify centrally.

**DONE & verified GREEN (do not redo):**
- **`core` `Chart` primitive** — accessible SVG sparkline (line/area/bar; `role="img"` + label;
  `currentColor`-driven; degrades to a flat baseline). Story + jest-axe test. The documented chart gap
  is closed; `BalanceTrend` + `AssetDetail` compose it.
- **Shared governed mechanism** — `fintech/src/formats/step-up.ts` generalizes the wire
  secondary-approval loop: one `stepUpApproval` envelope + `stepUpViolations(data, ctx, {mode, code, …})`
  across `approval` (four-eyes + payload binding), `second-factor`, and `acknowledge` modes; server-side
  `actionHash` binding (client never sends the hash). `wire-transfer` left byte-stable.
- **Two real governed components** (`fintech-react`) every non-wire flow mounts: **`GovernedActionDialog`**
  (review → collect authorizer → OTP → verdict; generic terms via `deriveActionTerms`) and
  **`MandatoryDisclosure`** (verbatim text → acknowledge → verdict). jest-axe clean; never validate
  client-side. Playground: generalized `regate-action.ts` (`"use server"`) + `GovernedActionDialogHost`
  / `MandatoryDisclosureHost` + `registry.tsx` mounts; `BlockedState` already resolves them generically.
- **20 governed flows** (each: cited schema reusing step-up + escalation → `GovernedActionDialog` /
  `MandatoryDisclosure` + fixtures `escalate`/`authorized`/`reject` + node test): ach, p2p, bill-pay,
  recurring-setup, fx-convert, crypto-withdraw, withdraw, issue-card, card-control, change-limit,
  security-change, add-user, kyc, add-payee, link-account, dispute, close-account, place-trade,
  enable-margin, credit-request, disclosure. Each threshold cited (`thresholds.ts`).
- **17 ungoverned reads** (each: shape-only `.strict()`/bounded/masked schema + fixtures
  `valid`/`validEmpty`/`adversarial` + presentational `fintech-react` component + jest-axe test):
  transaction-detail, account-list, statement-list, cashflow-summary, balance-trend, activity-feed,
  insight-card, recurring-list, invoice-list, asset-detail, order-history, fx-quote, crypto-holdings,
  savings-goal, net-worth, alerts-feed, search-results.
- **Wiring + proof:** registry (INTENTS + entries + `fintechIntentManifest`), both index barrels,
  playground `registry.tsx` + `scenarios.ts` (+78 scenarios; the old `close_account` unknown-intent demo
  repointed to `teleport_funds`), and `gate.test.ts` data-driven mount assertions — **105 gate tests**
  prove every read validates-then-mounts and every governed intent escalates to the correct
  un-bypassable component (or rejects on `.strict()`). `PATTERNS.md` all ✅.
- **Consolidation (honest):** `PATTERNS.md` "Escalates to" names are the *logical* targets; they're
  realized by `SecureWireDialog` / `GovernedActionDialog` / `MandatoryDisclosure` (noted in the catalog).
- **Follow-up — DONE (2026-07-03, Figma sync):** the deferred Figma work landed in file `kRTCdsBg4WpiGxQQGfvoLU`
  (run `sina-phase6-figma-sync-2026-07-03`, see [[sina-figma-file]]): **Chart** primitive page `123:2`
  (line/area/bar set `123:21` + States + Coverage); **GovernedActionDialog** scene `127:2` + **MandatoryDisclosure**
  scene `132:2` (both cloned off the signed-off `SecureWireDialog` anatomy, design sign-off waived per ROADMAP §A;
  new **FileText** glyph `130:2`); **Fintech Displays** `139:2` (the 17 new reads + 3 hero reads as composition
  cards); and a **Financial Dashboard** experience hero `147:2` (Light `147:3` + Dark `148:44`). Remaining pre-P6
  reads + Code Connect + Team-Library **publish** (manual UI step) are the only open, optional items.
- **Run tests `CI=true` + sandbox-off** (vitest `/tmp` EPERM under the command sandbox; per-package runs
  are green in-sandbox, the concurrent aggregate needs sandbox-off — see [[playground-dev-sandbox-port]]).

---

## Phase 6 — superseded detail: ungoverned render path + proving slice (2026-07-01)

Full plan: `since-this-is-a-ticklish-sutton.md`. Phase 6 reframed to **Agentic Fintech Experience (Governed + Ungoverned)** — SINA is a design system first, so it now renders agentic UI that carries **no** governance risk ("show my last 2 transactions") alongside the governed flows. **The enabling architecture + a proving slice are done; the full surface (workstreams A–F) and the whole catalog (Phase 6.5) remain.**

**DONE & verified GREEN (do not redo):**
- **Intent router** (`packages/governance/src/router.ts`, domain-agnostic): `dispatch(registry, { intent, props })` → `Decision { intent, props, result, mount }`, `mount = requiredComponent ?? (valid ? rule.component : null)`; `createRouter`, `dispatchAll`, `pattern()` builder, `UNKNOWN_INTENT` default-deny (still audited). The `{ valid, violations, requiredComponent }` contract is **untouched**; `ConstitutionRule` gained optional `component?` + a one-line `decidedComponent = requiredComponent ?? rule.component ?? null` (inert for existing rules → wire tests byte-identical).
- **Fintech registry** (`packages/fintech/src/registry.ts`): `fintechRegistry(ctx)` **factory** — the wire entry delegates via `evaluate:` to the untouched `evaluateWireTransfer(props, ctx)` so the four-eyes initiator is **never frozen**; `evaluateFintechIntent(envelope)` single entry; `INTENTS`; `fintechIntentManifest()` (Zod 3 → metadata; full prop JSON-schema deferred to a Zod-4 `z.toJSONSchema` follow-up). Two ungoverned schemas — `transaction-list`, `account-balance` (shape-only `.strict()`, bounded arrays, `maskedAccountRef`, `mask` redaction) + typed/adversarial fixtures.
- **Presentational components** (`packages/fintech-react`): `TransactionList`, `BalanceCard` compose `core` primitives, render validated props **as text** (never HTML), read-only (`onIntent?` re-gates any action), empty states, tolerant readers in `format.ts`. Banner broadened to "governed AND presentational".
- **Playground rewired to the router:** `gate.ts` (`runGate(envelope)` → `evaluateFintechIntent`, `GateTrace` gains `intent`/`mount`), `registry.tsx` (`resolvePresentational` + `resolveGovernedComponent`), `ChatThread.tsx` (mounts `Decision.mount`; wire keeps the ComparisonToggle money-shot), `run-emulator.ts`/`regate.ts` (envelope), `scenarios.ts` (+reads +unknown-intent), `gate.test.ts` + `a11y.test.tsx`.
- **Docs/machinery:** `packages/fintech/PATTERNS.md` (the full governed + ungoverned catalog across all domains, ✅/⬜), `/new-display-pattern` skill, ROADMAP Phase 6 reframe + **Phase 6.5** (agent-executed full-catalog sweep), `CLAUDE.md` skill entry.
- **Verified:** governance 18 (9 intercept + 9 router), fintech 51 (registry incl. wire byte-identical through the router + reads + unknown), fintech-react 9 (jest-axe zero violations; markup-renders-as-text), playground 17 (gate 13 + a11y 4); typecheck + lint green. **Run tests `CI=true` + sandbox-off** (a sandboxed install can EPERM mid-extract and corrupt the store → reconcile with a reinstall; see [[pnpm-install-sandbox-corruption]]).

**Expanded read catalog + demo (2026-07-02):** 8 more ungoverned reads — `SpendingBreakdown`, `BudgetProgress`, `CardList`, `RewardsSummary`, `PayeeList`, `UpcomingPayments`, `PortfolioHoldings`, `Watchlist` (each: shape-only schema + fixtures + presentational component + registry entry + manifest row + scenario + jest-axe). Playground add-ons: **live-mode intent routing** (`showData` tool built from `fintechIntentManifest()` — the model picks the read verb, the playground supplies fixture props so it never fabricates financial data), **composition** (`dispatchAll`/`runExperience` + a `Surface`; a "Financial dashboard" experience scenario = balance + transactions + spending, each gated independently), a **grouped scenario picker** (reads vs governed) with per-read adversarial scenarios, and a **validated-vs-governed** turn-header label. `PATTERNS.md` reads now 10/27 ✅. **a11y note:** display cards are plain containers (no `<section>`/`<header>` landmarks) so multiple reads on one page don't trip `landmark-unique`. Verified GREEN: fintech 59, fintech-react 28, playground (gate + a11y), 32/32 workspace.

**Superseded:** the "remaining workstreams A–F + Phase 6.5 sweep + chart primitive" noted here all
landed 2026-07-03 — see the **Phase 6 + 6.5 — DONE** section above.

---

## Phase 5 — DONE (2026-07-01)

Full plan: `lets-kickoff-phase-5-graceful-pizza.md`. Phase 5 = **the first end-to-end governed component**: `SecureWireDialog` with a **server-side-enforced** secondary managerial approval loop, un-bypassable from a hostile stream.

**DONE & verified GREEN (do not redo):**
- **New package `@sina-design-system/fintech-react`** — the governed-UI **third layer** (mirrors `core`'s scaffold: ESM→`dist`, jsdom+jest-axe vitest). The **one** package allowed to import both `core` and `fintech`; its `eslint.config.mjs` still bans `zod` + `defense`. Houses `src/SecureWireDialog/` (a 6-state phase machine — review → collect approver → 2nd-factor → approved/denied/error — composing Dialog/Alert/SummaryList/Badge/TextField/CredentialOTP/Stack) + `src/format.ts`.
- **`fintech` approval extension** (existing `wireTransferPayload` left byte-for-byte intact): `formats/canonical.ts` (`canonicalize`/`payloadHash`/`coreTerms`); `wireApproval` + `approvedWireTransferPayload = wireTransferPayload.extend({approval:optional}).strict()`; `ApprovalContext { initiatorId }` + `AGENT_INITIATOR_ID` (**initiator is server-supplied, never a payload field** — the model is the initiator); `makeWirePolicy(ctx)` enforces payload-binding (`APPROVAL_PAYLOAD_MISMATCH`) + separation-of-duties (`SELF_APPROVAL_FORBIDDEN`); `evaluateWireTransfer(payload, ctx)`; `WIRE_REDACTION` +`secondFactor`(drop) +`approverId`(hash); version 1.1.0. New fixtures for every bypass.
- **Playground harness:** `_lib/regate.ts` (`"use server"` — **binding hash computed server-side**, own file so tests don't pull the AI SDK), `_lib/registry.tsx` (`requiredComponent`→component, de-risks Phase 6), `_components/SecureWireDialogHost.tsx` (bridges trace→component, lifts approved `ConsoleView` to `EmulatorShell`), `BlockedState` rewired off the hard-coded string, 3 new scenarios, `gate.test.ts` +3, `primitives/secure-wire-dialog` story on the real action. `SecureWireDialogPlaceholder` deleted.
- **Agentic:** `/new-governed-component` skill authored; `CLAUDE.md` gained the `fintech-react` boundary + skill entry.
- **Verified:** build 8/8, typecheck 14/14, lint 14/14 (boundary enforced), tests 139 total green, runtime re-gate smoke vs built dist. **Run tests `CI=true` + sandbox-off**; a new package needs `pnpm install --no-frozen-lockfile`.

**Documented gaps (not blocking):** replay/staleness not enforced (`approval.challengeId` shape reserved → Phase 10 sink); no real identity/session (initiator is a server constant, approver entered in the dialog). Figma component for `SecureWireDialog` not yet built (design anatomy signed off in the plan; sync via `/primitive-figma-sync` + `/figma-component-coverage`).

---

## Phase 4 — DONE (2026-07-01)

Full plans: `analyze-phase-4-and-delegated-truffle.md` (build) + `pick-up-phase-4-cheerful-wall.md` (review/fix pass). Phase 4 = **"the SINA Emulator"** — a split-screen governed-agent sandbox (chat left / interception console right), light **and** dark, from SINA tokens + modern devtools trends, with a screenshot-referenced CodeBlock.

**DONE & verified GREEN (do not redo):**
- **Code** — the emulator lives at `apps/playground/app/page.tsx` (route `/`), all parts under `app/(emulator)/`:
  - `_components/`: `CodeBlock` (+ `highlight.ts` JSON tokenizer — line-numbers, Copy, SINA-token syntax theme, "See all" modal), `ConsoleTimeline`/`ConsoleStage`/`DecisionSummary`/`AuditLedger`/`ServerBoundary`, `ChatThread`/`GovernedWireSummary`/`BlockedState`/`TransportState`/`SecureWireDialogPlaceholder`/`ComparisonToggle`/`Composer`/`ScenarioPicker`/`ModeToggle`/`EmulatorShell`, plus `a11y.test.tsx`.
  - `_lib/`: `gate.ts` (`runGate` — server-side `evaluateWireTransfer`, tees the real `AuditEvent` via `setAuditSink`, measures latency, splits schema/policy violations), `run-emulator.ts` (`gateIntent` mock/direct + `gateLive` via `@ai-sdk/anthropic` **`generateText` tool-calling**, not `streamUI`, for robustness — interception seam identical, §1b honored), `scenarios.ts` (10 fixtures), `types.ts`, `format.ts`, `gate.test.ts`.
  - Wiring done in `package.json` (+`@ai-sdk/anthropic@1.2.12`, +`governance`), `next.config.mjs` (transpile governance), `vitest.config.ts` (node + `jsx:automatic`); Phase-0 spike route deleted.
  - **Verified:** workspace typecheck + lint, `next build` (28 routes, `/` dynamic), `pnpm --filter playground test` = 9/9 (5 gate + 4 jest-axe a11y, zero violations), prod SSR boot. **Run tests `CI=true` + sandbox-off** (vitest `/tmp` EPERM + pnpm no-TTY-purge memories).
- **Figma** (file `kRTCdsBg4WpiGxQQGfvoLU`, new **"Emulator"** page `65:2`): **CodeBlock component** `66:2` (matches the reference screenshot); **hero composition Light `65:3` + Dark `70:16`** (the $60k blocked flow), all colors bound to the Color collection (Light `6:0` / Dark `6:1`) so dark mode flips via mode switch. Both screenshot-verified.

**RESOLVED (2026-07-01 review/fix pass):**
1. **Design review** applied to **both** code and Figma. Composer clip fixed (⌘/Ctrl+Enter hint moved to a mono caption; textarea already `w-full`); block-the-stream reply now eases in (`motion-safe:animate-in`).
2. **Figma full component-ization complete:** `ConsoleStage` `81:143`, `ChatTurn` `87:686`, `DecisionSummary` `80:95`, `Composer` `83:82`, `ModeToggle` `82:103`, `ServerBoundary` `79:17` (variant sets) + `Coverage` `99:795`; 5 glyphs (Copy `78:2`, PaperPlaneTilt `78:6`, ArrowsClockwise `78:10`, Sun `78:16`, Moon `78:27`). Heroes rebuilt from real instances: Light `65:3` / Dark `96:1301` / governed-pass `97:595`. Fixed: composer full-width, real "governed by SINA" Badge (ShieldCheck), all hand-drawn alerts/buttons/chips → real instances, emoji → glyphs, console shows full pipeline + corrected **3** violations (SAR flag + CTR flag + approval escalate). **Mode-pin nuance:** dark hero = clone + frame pinned Color mode `6:1` + `clearExplicitVariableModeForCollection` on all descendants so instances inherit. See [[sina-figma-file]].
3. **Follow-ups (not blocking):** governed-hero Intent CodeBlock still shows the generic $60k payload (CodeBlock `66:2` has no text prop; SummaryList is the visual source of truth). Figma file still not published as a Team Library (manual Figma-UI step).
