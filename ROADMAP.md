# SINA — Project Plan & Roadmap

## Context

SINA is a strict, schema-driven UI architecture for AI agents. It intercepts an LLM's *intent* before it reaches the browser, evaluates the payload against Zod schemas (the "Constitution"), and either **blocks** the UI stream or **renders** an accessible, governed React primitive. The goal: neutralize hallucinated business logic, broken accessibility, and unauthorized actions at the edge.

It's free and aimed at startups and individuals who want to *pick up* a governed design system rather than build one — adopting agentic UI generation on primitives that aren't merely static, without owning the governance layer themselves.

This roadmap takes us from empty stubs to a working, adversarially-tested design system. **Phases 0–4 are complete** (foundation wiring, agentic setup, theme tokens, core primitives, the Zod constitution, and the AI-SDK emulator test bed). `.claude/PHASE_STATE.md` is the live source of truth for phase progress; this file is the *why* and the sequencing. **Scope note:** SINA now focuses **solely on the fintech domain** — the defense-logistics second domain (originally slated for a later phase) is descoped (see below).

**Starting inventory (baseline at roadmap authoring — the empty scaffold before any content):**
- ✅ Turborepo + pnpm workspaces, TypeScript 5.7, ESLint 9, Prettier 3 — all wired via `packages/config`
- ✅ `apps/playground` (Next.js 15, React 19, port 3001) — has `ai@4.0.30`, `zod@3.24.1`; page is a placeholder shell
- ✅ `apps/web` (Next.js 15, React 19, port 3000) — marketing shell, placeholder only
- ✅ `packages/theme` — empty stub (`export {}`); peer-deps `tailwindcss@^3.4`
- ✅ `packages/core` — empty stub; deps `radix-ui@1.1.2`, peer-deps React 18/19
- ✅ `packages/fintech` — empty stub; deps `zod@3.24.1`
- ⚠️ `packages/theme` Tailwind preset hook is declared in `apps/playground/tailwind.config.ts` but **not yet connected**

> Note: the original brief listed `packages/{theme,core,fintech}`. The actual repo also contains `packages/config` (shared TS/ESLint/Prettier presets) and `packages/governance` (the shared interception contract + audit emit, added in Phase 3). The roadmap accounts for all of them. A `packages/defense` for Use Case 2 (NSN/CAC) was originally scoped as a later phase but is now **descoped** — we focus solely on fintech. The `governance` abstraction still keeps a future second domain addable, but none is planned.

---

## 1. Working Dynamic — Designer × Developer

| | **You — Lead Product Designer** | **Me — Lead Developer** |
|---|---|---|
| **Owns** | Product vision, UX, structural layouts, component anatomy, governance *rules* (what's allowed) | Architecture, code, strict package boundaries, schema *implementation*, test harness |
| **Produces** | Figma frames, layout specs, token values, interaction states, the "constitution" intent | React primitives, Zod schemas, the playground harness, type-safe contracts |
| **Decides** | *What* a `<SecureWireDialog>` looks like and when it must appear | *How* it's enforced, rendered, focus-trapped, and proven |

**How we collaborate:**
1. **You define structure first.** Each phase begins with a design hand-off — a layout, token set, or governance rule. I do not invent UX; I translate it.
2. **I enforce architectural boundaries.** `theme` ships no React. `core` ships no domain logic. `fintech` ships no UI. I will push back if a hand-off would violate a boundary, and propose where the concern belongs instead.
3. **Design sign-off gates implementation.** The package stubs literally say *"lands here in the next step (pending design sign-off)."* I treat that as binding — I won't fill a package until its design is signed off.
4. **The playground is our shared truth.** Every governance rule you define gets an adversarial test I build. We judge "done" by whether a hostile LLM stream can break the rule — not by whether it compiles.
5. **Tight loop per phase:** Design hand-off → I implement → we review in the playground → sign-off → next phase.
6. **We codify our patterns, so I never reinvent the wheel.** Repeatable tasks (new primitive, new schema, new site section) become Claude Code **skills**; non-negotiable rules (the architectural boundaries, naming, a11y bar) become **CLAUDE.md rules + hooks**. This is set up in **Phase 0.5** before we build content — see §1a.

---

## 1a. Agentic Workflow Setup — Optimizing Us From Day One

The first time I create a primitive or a schema, we decide *how* it's done. We capture that decision **once** as a reusable asset so every subsequent request is fast, consistent, and boundary-safe — you ask "add a new schema" and I follow the established recipe instead of improvising. Set up in **Phase 0.5**, then refined as we discover patterns.

**A. `CLAUDE.md` (project rules — always in my context):**
- The three architectural boundaries as hard rules (`theme` = no React, `core` = no domain logic, `fintech` = no UI).
- Conventions: package naming (`@sina-design-system/*`), file layout, export style, the a11y bar (focus-trap + ARIA + keyboard) every primitive must meet.
- The interception contract shape (`{ valid, violations, requiredComponent }`) so every schema returns the same surface.
- Commands: how to build/test/run the playground; design-sign-off gate reminder.

**B. Skills (repeatable recipes — invoked with `/<name>`):**
| Skill | What it does | Lands |
|---|---|---|
| `/new-primitive` | Scaffolds a headless `core` primitive (Radix base, theme tokens, a11y states, playground story) from a design hand-off | Phase 0.5, hardened in Phase 2 |
| `/new-schema` | Scaffolds a Zod governance schema in `fintech` + interception contract + valid/adversarial fixtures | Phase 0.5, hardened in Phase 3 |
| `/new-governed-component` | Composes a `core` primitive + schema into a governed component (e.g. `SecureWireDialog`) wired to the harness | Phase 5 |
| `/new-web-section` | Adds a marketing/docs section to `apps/web` consuming `theme`, with layout conventions | Phase 7 |
| `/adversarial-test` | Generates a hostile-stream test case for the playground harness against a chosen schema | Phase 4 |

**C. Hooks (automated enforcement — the harness runs these, not me):**
- Post-edit: run `typecheck`/`lint` on touched packages so boundary violations surface immediately.
- Optional boundary guard: flag a React import landing in `theme`/`fintech`, or a domain term landing in `core`.

> These are living assets. Each is seeded in Phase 0.5 with our best guess, then refined the first time we hit the real task — the first hand-crafted primitive *becomes* the `/new-primitive` recipe. We are explicitly trading a little setup time now for consistency and speed across every later phase.

---

## 1b. Threat Model — The One Rule That Cannot Break

The entire product rests on a single invariant. Stating it explicitly so we never weaken it by accident:

> **The model emits *intent and props* — never a component. Validation runs server-side only. We validate, *then* mount. We never mount, then check.**

- With `streamUI` + React 19 RSC you cannot "un-render" tokens already streamed to the client. So the schema gate sits **before** any `core` primitive is allowed to mount, on the server.
- The model may never name or select the rendered component. It proposes a payload; **SINA** decides what renders, by mapping schema result → `requiredComponent`.
- Client-side validation is treated as untrusted UX sugar only. The authoritative gate is server-side and is the thing CI proves.

Every later phase is judged against this invariant.

## 2. Roadmap — Chronological Phases

### Phase 0 — Foundation Audit & Wiring *(no design dependency)*
**Goal:** Confirm the scaffold builds clean and connect the loose preset hook before we add content.
- Verify `pnpm install`, `pnpm build`, `pnpm typecheck`, `pnpm lint` pass across the workspace.
- Connect the `@sina-design-system/theme` Tailwind preset into both apps' `tailwind.config.ts` (currently a dangling NOTE).
- Establish the package-boundary lint rules (no React in `theme`/`fintech`, no domain logic in `core`).
- **Cloudflare spike:** validate Next 15 App Router + server actions + `streamUI` streaming on Cloudflare Pages' edge runtime (`@cloudflare/next-on-pages`/OpenNext) **now**, not at Phase 7 deploy.
- Add `vitest` + `jest-axe`/axe to the toolchain so the a11y bar and schemas are testable from day one.
- **Exit criteria:** green build, preset wired, boundaries enforced by tooling, Cloudflare streaming path confirmed.

### Phase 0.5 — Agentic Workflow Setup *(no design dependency)*
**Goal:** Codify our working relationship before building content, so repeatable tasks never get reinvented (see §1a).
- Author `CLAUDE.md` with the architectural boundaries, conventions, a11y bar, interception-contract shape, and project commands.
- Seed initial skills: `/new-primitive`, `/new-schema`, `/new-web-section`, `/adversarial-test` (best-guess recipes, refined when first used for real).
- Add post-edit `typecheck`/`lint` hooks and an optional boundary-guard hook.
- **Exit criteria:** rules in context; skills invokable; hooks fire on edit. Each recipe is explicitly marked "to be hardened on first real use."

### Phase 1 — Theme & Design Tokens (`packages/theme`)
**Design hand-off:** color/spacing/typography/radius scales, semantic tokens (e.g. `intent.danger`, `surface.secure`), CSS variable names.
**Goal:** Single source of truth for visual language — Tailwind preset + CSS variables. **No React.**
- Implement design tokens as a Tailwind preset and a CSS-variables layer.
- Export the preset; both apps consume it.
- **Exit criteria:** tokens render in both apps; changing a token value propagates everywhere.

### Phase 2 — Core Primitives (`packages/core`)
**Design hand-off:** component anatomy and interaction states for the headless primitives (Dialog, Grid, CurrencyField, focus-trap behavior, a11y intent).
**Goal:** Headless, fully accessible, **domain-agnostic** React primitives built on Radix UI, styled via `theme`.
- Build base primitives: `Dialog` (focus-trapped, ARIA-correct), layout `Grid`, `CurrencyField`, and the shells that governed components will extend.
- Strictly no business rules — these know nothing about $50,000 limits or NSNs.
- **A11y gate:** wire `jest-axe`/axe checks so every primitive is automatically gated on accessibility (matches the "fully accessible" promise).
- **Exit criteria:** primitives are keyboard-navigable, focus-trapped, screen-reader correct, **pass automated axe checks**; rendered in isolation in the playground.

### Phase 3 — The Zod Constitution (shared `governance` + `packages/fintech`)
**Design hand-off:** the governance *rules* — limits, allowed actions, classification logic (e.g. standard transfer `amount <= 50000`, required secondary approval thresholds).
**Goal:** Pure Zod schemas that intercept and validate LLM payloads. **No React, no UI.**
- Extract a **shared `governance` abstraction** (the interception contract + audit emit point) so `fintech` — and any future governance domain — implements the same surface and never drifts.
- Encode rules as Zod schemas (the "constitution").
- Define the **interception contract**: payload-in → `{ valid, violations, requiredComponent }` out. This is the seam the playground exercises.
- **Audit trail:** every interception emits a structured, auditable event (`{ timestamp, payload, result, violations, decidedComponent }`). Defined as a contract here; the real sink is wired later. This is core to the compliance positioning.
- Map violations to the governed component that must render instead (e.g. limit breach → force `SecureWireDialog`).
- **Exit criteria:** schemas validate/reject sample payloads with typed results; unit-tested against valid + adversarial fixtures; every decision emits an audit event.

### Phase 4 — The Playground Test Bed (`apps/playground`) ★ AI SDK INTEGRATION
**Design hand-off:** the **blocked / intercepted state** — what the user sees when SINA drops a stream (its own layout and states, a first-class UX moment).
**Goal:** The Adversarial Sandbox — wire a real Vercel AI SDK `streamUI` flow through the Constitution and prove interception works end-to-end. **This is where AI SDK meets schemas.** (See §3 for the detailed test matrix.)
- Build the `streamUI` harness in `apps/playground` (`ai@4.0.30` is already installed). Validation runs **server-side** per §1b.
- Insert the interception layer between the model's tool/UI intent and the actual render: every payload passes through `governance`/`fintech` schemas *before* a `core` primitive is allowed to mount.
- Govern the render: pass → safe accessible primitive; fail → block the stream and render the **designed blocked state**, then force the governed component.
- **Deterministic mock mode:** a recorded/synthetic hostile-stream provider so the adversarial suite runs without a live LLM (reproducible, cheap, CI-safe). Live-model mode kept for manual exploration (Anthropic key via env).
- Build the adversarial input panel: feed hostile/hallucinated streams (over-limit transfers, fabricated "Confirm" buttons) and observe the block.
- **Exit criteria:** a $60,000 transfer stream is intercepted and renders the blocked state → `<SecureWireDialog>` instead of a raw confirm; a compliant $5,000 transfer renders the standard primitive; both run in mock mode under CI.

### Phase 5 — Governed Fintech Components (Use Case 1 — Wire Transfer)
**Design hand-off:** `<SecureWireDialog>` anatomy — secondary managerial approval flow, states.
**Goal:** Compose `core` primitives + `fintech` schemas into the first end-to-end governed component.
- Build `<SecureWireDialog>` (requires secondary approval, cannot execute until satisfied).
- Validate the full loop in the playground against the Phase 4 harness.
- **Exit criteria:** the wire-transfer use case is demonstrably un-bypassable from a hostile stream.

### Phase 6 — Agentic Fintech Experience (Governed + Ungoverned)
**Design hand-off:** the anatomy + interaction/blocked states for the full family of governed fintech surfaces beyond the wire dialog — money-movement flows, account/onboarding forms, card operations, governed read-only data displays, and mandatory regulatory disclosures. Delivered incrementally, **one signed-off hand-off per surface** (design sign-off still gates implementation, §1 rule 3).

**Goal:** Generalize the Phase 5 pattern (one `core` primitive + one `fintech` schema → one governed component) across the **entire fintech experience**, so SINA governs a realistic banking app end-to-end — not a single transfer. The interception seam, validate-then-mount invariant (§1b), and audit trail must hold for *every* fintech action and data surface, all reusing the shared `governance` seam and emitting the same `{ valid, violations, requiredComponent }` contract. Each surface lands as: `core` primitive + `fintech`/`governance` schema + valid/adversarial fixtures + an emulator scenario.

**Architecture milestone (landed): the ungoverned render path.** SINA is a *design system first*, so this phase also opens agentic UI that carries **no** governance risk ("show my last 2 transactions"). A domain-agnostic **intent router** (`@sina-design-system/governance` `dispatch`) maps a `{ intent, props }` envelope → the pattern's constitution rule → the component to mount, resolving the mount *outside* the untouched `{ valid, violations, requiredComponent }` contract. An **ungoverned** pattern is a rule with a schema but **no policy/escalation**: it is shape-validated (`.strict()`, bounded, masked — and still audited) then mounts a **presentational** component (`TransactionList`, `BalanceCard`). Governance is now an *optional escalation layer* on a **universal** validate-then-mount. Catalog: `packages/fintech/PATTERNS.md`; ungoverned scaffold: `/new-display-pattern`.

Grouped into workstreams (each a candidate hand-off; sequence by product priority):

- **A. Money movement (actions) — beyond wire.** Extend the payment surface with per-rail thresholds/rules: ACH / internal transfer, P2P (Zelle-style), and bill pay reuse the `SecureWireDialog` approval mechanics as variants; FX / currency conversion adds rate + ISO-4217 minor-units correctness and spread disclosure; scheduled / recurring payments add standing-order governance (cumulative limits, cancel-ability). → `SecurePaymentDialog` (multi-rail).
- **B. Account & onboarding (governed forms).** Add/verify payee or beneficiary (fraud-sensitive → step-up auth on a new payee); account opening / KYC with identity + sanctions/OFAC screening gating any funded action; user-set spending limits & controls that themselves become constitution inputs. → `PayeeVerificationDialog`, `KycGateDialog`.
- **C. Card operations.** Freeze/unfreeze, dispute a charge, issue a virtual card — each an interceptable, authorization-gated action. → `CardActionDialog`.
- **D. Governed data display (read-only).** Governance is not only about blocking actions — it is safe *presentation* of sensitive data. Account balance + transaction history + statements render through accessible `core` primitives with **PAN/PII masking** (masked account/card numbers, never full digits), so a hallucinated stream can neither exfiltrate nor fabricate financial data. → `GovernedTransactionTable`, `GovernedStatement`.
- **E. Mandatory disclosures.** Regulatory text (Reg E, Truth-in-Lending, FX-spread disclosure) that the model **cannot alter or omit** — SINA injects the verbatim, audited disclosure as part of the governed render and never trusts the model to produce it. → `DisclosurePanel`.
- **F. Ungoverned display patterns (reads).** The non-governed half of a real app: transaction lists, balances, cards, payees, spending, holdings, statements — each a **shape-only** `fintech` schema (`.strict()`, bounded arrays, masked account/PAN) + a presentational `fintech-react` component the router mounts on a clean pass. Read-only: any action re-enters the gate as a **new intent** (never a raw button). → `TransactionList`, `BalanceCard`, … (see `PATTERNS.md`).

- **Constitution expansion:** grow `packages/fintech` from the single wire-transfer schema into a rule-set spanning all of the above — payment-rail limits, new-payee risk, KYC/sanctions state, card-action authorization, the disclosure-required matrix — each cited like the Phase 3 `thresholds.ts`, all still emitting the standard interception contract + audit event.
- **Skill:** the Phase 5 `/new-governed-component` recipe is exercised repeatedly here and hardened for the family (dialog variants, read-only governed-data primitives, disclosure injection).
- **Exit criteria:** every surface above is demonstrably **un-bypassable from a hostile stream** in the playground emulator (mock mode, CI) — over-limit/unauthorized actions are blocked and forced into the correct governed component; sensitive data renders masked and cannot be fabricated; mandatory disclosures are always present and verbatim. The emulator scenario set covers the full family, not just the $60k wire.

> *(This slot previously held the now-descoped defense-logistics domain — SINA is fintech-only. The Phase 3 `governance` abstraction still keeps a future non-fintech domain addable, but none is planned.)*

### Phase 6.5 — Full Fintech Pattern Catalog (agent-executed)
**Goal:** Implement **every** pattern in `packages/fintech/PATTERNS.md` — the ungoverned display family and the governed flow family across all domains (banking, cards, payees/bills/recurring, investing/crypto, B2B/approvals). Because the repeatable skills make each pattern near-mechanical once the Phase 6 architecture exists, this is an **agent-executed sweep measured in hours, not weeks** — the AI agent fans out over the catalog rows rather than hand-building each.

- **Method:** per pattern — `/new-display-pattern` (ungoverned) or `/new-schema` + `/new-governed-component` (governed) → schema + fixtures → component → `registry.ts` entry + `fintechIntentManifest()` row → playground scenario → verify. Optionally orchestrated as a **workflow** fanning out over `PATTERNS.md` rows (schema → component → scenario → verify per pattern).
- **Prerequisites:** a `core` **chart/sparkline** primitive (`/new-primitive`) for the investing/crypto + trend reads (currently a gap); a `core` **`Table`** primitive if columnar-read a11y needs more than the list form. Multi-pattern **experiences** (dashboards) compose via `dispatchAll` + a thin `Surface`.
- **Exit criteria:** every catalog row has a registry entry, a green gate test, and a playground scenario (display components also pass jest-axe); `PATTERNS.md` status column is all ✅.

### Phase 7 — Documentation (Fumadocs) (`apps/web/docs`)
**Design hand-off:** the docs *skin* — Fumadocs chrome themed to SINA tokens (nav, sidebar, TOC, search, code blocks), plus the docs information architecture. Not the bespoke landing (that is Phase 9).
**Goal:** The reference + conceptual documentation: App-Router-native, MDX-based (so we embed live read-only React demos inside the docs), themed to SINA tokens rather than Fumadocs' default skin. This is the **first `apps/web` content**, so it stands up the shared web infrastructure (Cloudflare deploy pipeline, Tailwind-preset composition, `transpilePackages`) that Phase 9 then reuses.

**Tooling decision — Fumadocs.** Docs are built with [Fumadocs](https://fumadocs.dev): App-Router-native, MDX-based, with built-in search, sidebar, and TOC. *Constraint:* the repo is on Tailwind 3.4 — pin the Tailwind-3-compatible Fumadocs line and compose its preset with the existing `@sina-design-system/theme` preset (do not pull the Tailwind-4-only major).

**Sequencing — build the shell now, fill later.** The docs engine, deploy pipeline, information architecture, and all architecture/boundary/"add a domain" prose are buildable today against the current stubs. The component showcase and the live demo embed are stubbed placeholders that light up as `theme`/`core`/the playground land. Each area below is tagged `[now]` or `[needs Px]`.

**As-built note (supersedes the Tailwind language below).** Tailwind was removed repo-wide (co-located CSS Modules now), so docs use **headless `fumadocs-core` only — no `fumadocs-ui`, no Tailwind preset, no `--color-fd-*` mapping**; all docs chrome is hand-built from SINA `core` primitives + `--sina-*` CSS Modules. The API Reference is **hand-written**; the TSDoc→MDX auto-generation is deferred to Phase 10. See `.claude/PHASE_STATE.md` for the verified as-built state.

**Information architecture** — *Docs* (`/docs`, MDX in `content/docs/`), six sections:

| Section | Pages | Status |
|---|---|---|
| **Getting Started** | Introduction · The One Invariant (§1b) · Quickstart | `[now]` |
| **Concepts** | Threat model · Interception contract (`{ valid, violations, requiredComponent }`) · Audit trail · Mock vs. live mode | `[now]` |
| **Architecture** | The three layers · Package boundaries (the three rules + how ESLint enforces them) · streamUI integration (the §3 seam) | `[now]` |
| **Guides** | ★ **Add a governed domain** (the extensibility path the `governance` abstraction enables) · **Theme the primitives** (brand-open vs governance-locked tokens · `createTheme` · `[data-theme]` scopes) `[needs P10]` · Add a primitive · Add a schema · Write an adversarial test | `[now]` |
| **Reference** | `theme` · `core` · `fintech` · `governance` — **hand-written now; TSDoc→MDX auto-gen deferred to P10** | `[now]` |
| **Components** | Read-only live demos: Dialog · CurrencyField · Grid · SecureWireDialog | `[now]` |

**Implementation notes (not a full build plan):**
- Add Fumadocs deps; put docs under a `docs` segment (reserve a `(marketing)` route group for the Phase 9 landing so the two layout systems don't collide); compose Tailwind presets; map Fumadocs' `--color-fd-*` variables onto SINA semantic tokens so docs chrome inherits the SINA palette.
- **Live governance demo (factored here, reused in Phase 9):** reuse the Phase 4 deterministic harness as a read-only, mock-mode widget (canned hostile/compliant streams, no live LLM), embedded in the Components/Concepts pages. **Factor the harness's presentational component + fixtures** so both the docs *and* the Phase 9 landing can embed the same thing. Run the schema check **server-side** (server action / edge route) to honor §1b — the embed mirrors the real gate, it doesn't fake it. Add `@sina-design-system/fintech` to `transpilePackages` in `apps/web/next.config.mjs`.
- **Auto-generated API Reference:** generate the Reference section from **TSDoc comments** in `packages/*` (TypeDoc → MDX) so reference docs never drift from the typed contracts; hand-write only the narrative around them. This puts a light TSDoc-comment expectation on `theme`/`core`/`fintech` as they fill in.
- **`llms.txt` + Markdown export:** emit a Fumadocs `llms.txt` index and per-page raw-Markdown so AI agents can consume SINA's own docs — on-brand for a product about governing AI agents.
- **Cloudflare deploy (stood up here):** `@cloudflare/next-on-pages` with the mandatory `nodejs_compat` flag (carried forward from the Phase 0 spike — without it the worker errors instead of serving). Prefer Fumadocs **static search** (prebuilt index, client-side) on Pages over an edge search route. `allowBuilds` for `esbuild`+`sharp` is already set in `pnpm-workspace.yaml`.
- Seed the `/new-web-section` skill (§1a) once the first docs section exists.

- **Exit criteria:** docs build and deploy to Cloudflare Pages; the docs **themselves pass the a11y bar** (axe + keyboard + screen-reader), dogfooding the same gate `core` primitives must meet. Verify locally with `pnpm dlx @cloudflare/next-on-pages@1` then `wrangler pages dev .vercel/output/static --compatibility-flags=nodejs_compat`, mirroring the Phase 0 spike.

### Phase 8 — npm Publish Pipeline
**Goal:** The `@sina-design-system/*` packages are publishable to npm — versioned, CI-gated, and validated — so a consumer can `pnpm add @sina-design-system/core`. This phase makes everything *ready*; the first real publish is a manual, credentialed maintainer step.
- **Versioning/release flow (changesets):** `@changesets/cli` at the root with `access: "public"`; `changeset` / `version` / `release` scripts. The five public packages (`theme`/`core`/`governance`/`fintech`/`fintech-react`) version independently; `config` + `governance-demo` stay `private` and are never published. `workspace:*` internal deps are rewritten to real versions on publish.
- **CI (`.github/workflows/`):** `ci.yml` runs `build` + `typecheck` + `lint` + `test` (vitest schema/gate + jest-axe + the playground adversarial suite, mock mode) on every PR — the adversarial suite + axe checks are **required checks**. `release.yml` uses the changesets action to open a Version PR and publish on merge (`NPM_TOKEN` + provenance via `id-token: write`).
- **Package metadata:** every public package ships a `README.md`, a `LICENSE` (MIT), and full npm fields (`description` / `repository`+`directory` / `homepage` / `bugs` / `keywords` / `author`) so its npm page isn't bare.
- **Publishability validation:** a dependency-classification audit (every runtime import is a real `dependency`; `react`/`react-dom` stay peers), `publint` + `arethetypeswrong` on each package/tarball, and `pnpm publish -r --dry-run` proving the tarballs assemble (`dist` + README + LICENSE, no `src`) with the private packages skipped.
- **Prerequisite (manual):** the `@sina-design-system` npm org must exist and be owned by the maintainer before the first scoped publish.
- **Exit criteria:** `changeset status` shows pending versions; `publint`/`attw` clean; `pnpm publish -r --dry-run` green for the five public packages (private ones skipped); CI required checks enforced on PRs. The first real `changeset publish` is a maintainer step (npm login + 2FA).

### Phase 8.5 — Documentation UX (make the docs user-friendly)
**Design hand-off:** the content *voice* + a first-run reading path (what a newcomer reads in their first ~10 minutes), and any diagrams/screenshots that should replace dense prose.
**Goal:** Rewrite and restructure the *existing* Phase 7 docs so a reader with **no prior SINA context** understands what it is, why they'd use it, and can get something running — concrete over conceptual, task-oriented over reference-first. No docs-engine work (Phase 7 stands); this is a content pass on `apps/web/content/docs/**`.
- **Lead with outcomes, not architecture:** rewrite Introduction + Quickstart so the first thing a reader sees is "what problem this solves *for me*" and a copy-pasteable start path — not the threat model. Keep the positioning (free · for startups & individuals · no governance tax).
- **Cut the jargon (or define it on first use):** `intent`, `constitution`, `interception seam`, `validate-then-mount` are defined the first time they appear, or replaced with plain language; the precise terms stay in Concepts for readers who want depth.
- **Show, don't tell:** every Concept page carries a real snippet or the mock-mode live demo (already factored in Phase 7) instead of describing the behavior in prose.
- **Task-oriented Guides:** reframe Guides as "I want to…" jobs (brand the primitives · install and render one governed component · block an over-limit action) with end-to-end steps.
- **Progressive disclosure:** a clear path — Introduction → Quickstart → one governed component → Concepts — so depth is opt-in, not front-loaded.
- **Visuals over walls of text:** use a static interception-seam diagram / screenshots where a picture is clearer (the animated seam artifact still lands in Phase 9).
- **Dogfood unchanged:** docs still pass the a11y bar (axe + keyboard + screen-reader) and all internal links stay valid after the restructure.
- **Exit criteria:** a reader unfamiliar with SINA can, from the live docs — (1) state what SINA does and why in one sentence, (2) install and render a primitive/governed component straight from the Quickstart *without* reading the architecture, and (3) find a task-oriented guide for their goal. Jargon is defined-on-first-use; docs still build + deploy to Cloudflare and pass axe.

### Phase 9 — Marketing Site (`apps/web` landing)
**Design hand-off:** bespoke landing layouts, narrative, live demo embeds, and a rendered/animated version of the interception-seam diagram (§3 is ASCII today — the real one is a design artifact).
**Goal:** The public face — a single rich, fully bespoke scrollytelling landing page consuming `theme` (and read-only demos of `core`). It reuses the docs engine's shared web infra + the mock-mode demo embed factored in Phase 7, and links into `/docs`. It markets the **published** system (Phase 8 makes the packages installable), with final release hardening (Phase 10) following.

**Information architecture** — *Landing* (bespoke, `app/(marketing)/page.tsx`), one scrollytelling page consuming `theme`:
1. Hero — the thesis (*the model emits intent; SINA decides what renders*) + CTA → `/docs`. **Lead with the positioning: free, for startups & individuals, no governance tax — pick up a governed design system instead of building one.** `[now]`
2. The threat — hallucinated business logic, broken a11y, unauthorized actions. `[now]`
3. The interception seam — the diagram from §3. `[now]`
4. Live governance demo — the mock-mode embed factored in Phase 7. `[needs P7]`
5. Three-layer architecture — `theme` → `core` → `governance`/`fintech`, boundaries stated as guarantees. `[now]`
6. Closing CTA — docs + GitHub. `[now]`

**Implementation notes (not a full build plan):**
- The landing lives in a `(marketing)` route group so its bespoke layout doesn't collide with the `docs` segment from Phase 7; it deploys through the **same Cloudflare pipeline** stood up in Phase 7.
- **Live governance demo:** embed the read-only mock-mode widget factored in Phase 7 as the landing's section 4 — the schema check still runs **server-side** per §1b; the embed mirrors the real gate.
- **Interception-seam diagram:** render/animate the §3 seam as a first-class design artifact (the ASCII in §3 is a placeholder for it).

- **Exit criteria:** the landing builds and deploys to Cloudflare Pages through the Phase 7 pipeline; the landing **itself passes the a11y bar** (axe + keyboard + screen-reader), dogfooding the same gate `core` primitives must meet.

### Phase 10 — Release Hardening
**Goal:** The published system is production-hardened — a real audit sink + a locked-down theming/rebranding contract. (Versioning, CI, and publishability landed in Phase 8.)
- Wire the **audit trail** to a real sink (replacing the Phase 3 stub).
- **Theming contract & primitive packaging** (so published `core` is both consumable *and* rebrandable — see §6):
  - **Ship prebuilt CSS + keep the token contract (both modes).** `core` already ships `styles.css` (co-located CSS Modules, extracted at Vite-lib build), exported as `@sina-design-system/core/styles.css`; the compiled CSS references `--sina-*` via `color-mix` — **never inlined hex** — so var-override rebranding flows through. (Tailwind was removed repo-wide; the earlier "Tailwind CSS build / preset" framing is superseded.)
  - **Publish the typed theming API** in `theme`: `createTheme()` / `themeVars()` over the **brand-open** token set, with **governance-locked** roles (`danger*`, `surface-secure`, `focus-ring`, `intent-*`) excluded from the type so a sanctioned theme cannot neuter a security/a11y affordance. *(Seeded now — `packages/theme/src/create-theme.ts` + partition test.)*
  - **Contrast guard:** generalize the `theme` WCAG-AA test into `assertThemeContrast(overrides)` so a brand override that breaks a required fg/bg pairing fails loudly.
  - **Build guard:** assert `core/styles.css` contains `var(--sina-` and no raw hex in themeable properties (proves rebranding survives the compile).
- **API Reference auto-generation:** stand up the TSDoc→MDX pipeline (deferred from Phase 7) so the docs Reference section never drifts from the typed contracts.
- **Exit criteria:** audit events land in a real sink; `core` renders styled from `styles.css` alone *and* a `createTheme` brand theme rebrands it without touching primitives or governance-locked tokens; the "Theme the primitives" docs guide is live.

---

## 3. Playground × AI SDK — When & Where (explicit)

The `apps/playground` Adversarial Sandbox is the **only** place the Vercel AI SDK (`streamUI`) is integrated and tested. It is used:

| Phase | What the playground tests against schemas |
|---|---|
| **Phase 2** | Renders `core` primitives in isolation (no AI yet) — visual/a11y sanity. |
| **Phase 4 ★** | **Primary AI SDK integration.** Wires `streamUI` → interception layer → `fintech` schemas → governed render. Builds the adversarial input panel. |
| **Phase 5** | Runs the `<SecureWireDialog>` loop end-to-end against hostile $60k streams. |
| **Phase 6** | Runs the full governed-fintech-component family against hostile streams across every surface — payments/FX, payee/KYC, card ops, masked data displays, mandatory disclosures. |
| **Phase 7** | The docs (Fumadocs) embed this harness's **mock mode** as read-only demos in the Components/Concepts pages (no live LLM); the schema check still runs server-side per §1b. |
| **Phase 8** | The adversarial suite (mock mode) becomes a **required CI check** in the npm publish pipeline. |
| **Phase 9** | The marketing landing embeds the same factored **mock-mode** demo as its live-governance section. |

**The interception seam (the heart of SINA), exercised in Phase 4:**
```
LLM stream (streamUI intent / tool payload)
        │
        ▼
[ fintech Zod schema .safeParse ]   ← the Constitution
        │
   ┌────┴────┐
 PASS       FAIL
   │           │
 render      BLOCK stream → force governed primitive
 core         (SecureWireDialog)
 primitive
```

---

## 4. Critical Files

**Wire-up / Phase 0–1:**
- `apps/playground/tailwind.config.ts`, `apps/web/tailwind.config.ts` — connect theme preset (resolve dangling NOTE)
- `packages/theme/src/index.ts` — tokens + Tailwind preset (currently `export {}`)

**Phase 2:**
- `packages/core/src/index.ts` — primitives (currently `export {}`); built on `radix-ui@1.1.2`

**Phase 3:**
- new `packages/governance/*` — shared interception contract + audit emit point
- `packages/fintech/src/index.ts` — Zod schemas built on `governance` (currently `export {}`)

**Phase 4 (AI SDK):**
- `apps/playground/app/page.tsx` — replace placeholder shell with the harness
- new **server action / route** for `streamUI` (`ai@4.0.30`) — server-side validation per §1b
- mock-model provider module for deterministic CI runs

**Later:**
- **Phase 7 (`apps/web` docs):** `source.config.ts`, `lib/source.ts`, `app/docs/page.tsx` + `app/docs/[...slug]/page.tsx` (split static index + catch-all), `app/docs/layout.tsx`, hand-built chrome under `app/components/docs/**`, `content/docs/**/*.mdx` (six sections), `app/llms.txt/route.ts` + per-page `.md` export, `wrangler.toml`; edit `next.config.mjs` (`transpilePackages` for all `@sina-design-system/*`); new `@sina-design-system/governance-demo` package = the factored mock-mode demo embed. *(Headless `fumadocs-core` — no Tailwind/`--color-fd-*`.)*
- **Phase 8 (release/CI pipeline):** `.changeset/config.json` + root `changeset`/`version`/`release` scripts; `.github/workflows/{ci,release}.yml`; per-public-package `README.md` + `LICENSE` + npm metadata fields
- **Phase 8.5 (docs UX):** rewrite `apps/web/content/docs/**/*.mdx` (Getting Started + Guides + Concepts voice); no engine/route changes
- **Phase 9 (`apps/web` landing):** new `app/(marketing)/page.tsx` + section components (bespoke landing); reuses the Phase 7 demo embed + Cloudflare pipeline
- **Phase 10 (packaging/theming):** `packages/theme/src/create-theme.ts` (typed brand-open/governance-locked contract — **seeded**) + `assertThemeContrast`; `core/styles.css` build guard; real audit sink; TSDoc→MDX Reference generation

---

## 5. Verification

Per phase, "done" means:
- **Build green:** `pnpm build && pnpm typecheck && pnpm lint` clean across the workspace.
- **Theme (P1):** change a token → value propagates to both apps.
- **Core (P2):** keyboard/focus-trap/screen-reader checks pass **and automated axe checks are green** on primitives in the playground.
- **Schemas (P3):** `vitest` over valid + adversarial fixtures; `.safeParse` returns typed `{valid, violations, requiredComponent}`; each decision emits an audit event.
- **Interception (P4–P6) — the real test:** run the playground (`pnpm dev`, port 3001) in **mock mode**, feed a $60,000 transfer stream → assert the raw confirm is **blocked**, the designed blocked state shows, and `<SecureWireDialog>` renders; feed a compliant $5,000 stream → assert the standard primitive renders. Confirm validation is server-side (§1b).
- **CI (P8):** adversarial suite (mock mode) + axe checks are required checks on every PR.

---

## 6. Theming Contract — Consumer Rebranding

SINA ships primitives *and* a supported way to make them match a consumer's brand. The rule mirrors the internal architecture: **rebrand at the token layer, never edit the primitives.** Dark mode in `theme.css` (a `[data-theme="dark"]` block that only reassigns `--sina-*` vars) is the proof this works — a brand is just another such block.

**Three tiers (brand theming lives in Tier 1):**
1. **CSS-variable override (recommended).** Reassign the semantic `--sina-color-*` (and `radius`/`space`/`text`/`font`) vars in a `:root` or `[data-theme="acme"]` scope. Runtime, no rebuild, dark-mode-composable. `createTheme()` / `themeVars()` (in `@sina-design-system/theme`) are the typed emitters.
2. **Preset composition (Tailwind consumers).** Compose `@sina-design-system/theme/tailwind` with the consumer's own preset for brand tokens as first-class utilities.
3. **Per-instance `className`.** `core`'s `cn()` guarantees a caller's `className` wins — for one-off layout tweaks, not systemic brand color.

**Brand-open vs governance-locked.** The token contract is split: **brand-open** roles (`bg`/`surface*`/`text*`/`border*`/`primary*`/`secondary*`/`success|warning|info*`, plus `radius`/`space`/`text`/`font`) are the rebranding surface; **governance-locked** roles (`danger*`, `surface-secure`, `focus-ring`, `intent-*`) are reserved so a theme can't quiet a security or a11y affordance. The lock is enforced on the *sanctioned path* — `BrandTheme` excludes locked roles, so `createTheme()` rejects them at compile time (raw CSS can still force them by specificity; the API won't). A partition test keeps the two sets from drifting out of `colorTokens`.

**Distribution (both modes, so var-override works either way).** `core` ships a prebuilt `styles.css` (compiled utilities that still reference `--sina-*` via `color-mix` — never inlined hex) *and* keeps the Tailwind preset. A non-Tailwind app imports the CSS; a Tailwind shop uses the preset. Because neither inlines color, Tier-1 rebranding flows through both.

**Where it lands:** the typed contract is seeded now (`packages/theme/src/create-theme.ts`); the prebuilt-CSS build guard, `assertThemeContrast` guard, and the "Theme the primitives" docs guide complete in **Phase 10** (packaged/published in **Phase 8**).

---

## Next Step

Phases 0–8 are complete (see `.claude/PHASE_STATE.md` for verified status) — the docs are live on Cloudflare Pages and all five public `@sina-design-system/*` packages are published to npm at 0.1.0. **Next: Phase 8.5 — Documentation UX** — a content pass on the existing Phase 7 docs (`apps/web/content/docs/**`) to make them user-friendly for a newcomer with no prior SINA context: lead with outcomes over architecture, define/cut the jargon, favor runnable snippets and the mock-mode demo over prose, and reframe Guides as task-oriented "I want to…" jobs. No docs-engine work; Phase 7 stands. Then **Phase 9 — Marketing Site** drives traffic into the improved `/docs`.
