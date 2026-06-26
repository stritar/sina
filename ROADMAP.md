# SINA — Project Plan & Roadmap

## Context

SINA is a strict, schema-driven UI architecture for AI agents. It intercepts an LLM's *intent* before it reaches the browser, evaluates the payload against Zod schemas (the "Constitution"), and either **blocks** the UI stream or **renders** an accessible, governed React primitive. The goal: neutralize hallucinated business logic, broken accessibility, and unauthorized actions at the edge.

The monorepo is **fully scaffolded but content-empty**. Infrastructure is complete and working; no components, schemas, tokens, or landing pages exist yet. This roadmap takes us from empty stubs to a working, adversarially-tested design system.

**Current inventory (verified):**
- ✅ Turborepo + pnpm workspaces, TypeScript 5.7, ESLint 9, Prettier 3 — all wired via `packages/config`
- ✅ `apps/playground` (Next.js 15, React 19, port 3001) — has `ai@4.0.30`, `zod@3.24.1`; page is a placeholder shell
- ✅ `apps/web` (Next.js 15, React 19, port 3000) — marketing shell, placeholder only
- ✅ `packages/theme` — empty stub (`export {}`); peer-deps `tailwindcss@^3.4`
- ✅ `packages/core` — empty stub; deps `radix-ui@1.1.2`, peer-deps React 18/19
- ✅ `packages/fintech` — empty stub; deps `zod@3.24.1`
- ⚠️ `packages/theme` Tailwind preset hook is declared in `apps/playground/tailwind.config.ts` but **not yet connected**

> Note: the original brief listed `packages/{theme,core,fintech}`. The actual repo also contains `packages/config` (shared TS/ESLint/Prettier presets). The roadmap accounts for both. A `packages/defense` for Use Case 2 (NSN/CAC) does **not** exist yet and is scoped as a later phase.

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
- The three architectural boundaries as hard rules (`theme` = no React, `core` = no domain logic, `fintech`/`defense` = no UI).
- Conventions: package naming (`@sina-design-system/*`), file layout, export style, the a11y bar (focus-trap + ARIA + keyboard) every primitive must meet.
- The interception contract shape (`{ valid, violations, requiredComponent }`) so every schema returns the same surface.
- Commands: how to build/test/run the playground; design-sign-off gate reminder.

**B. Skills (repeatable recipes — invoked with `/<name>`):**
| Skill | What it does | Lands |
|---|---|---|
| `/new-primitive` | Scaffolds a headless `core` primitive (Radix base, theme tokens, a11y states, playground story) from a design hand-off | Phase 0.5, hardened in Phase 2 |
| `/new-schema` | Scaffolds a Zod governance schema in `fintech`/`defense` + interception contract + valid/adversarial fixtures | Phase 0.5, hardened in Phase 3 |
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
- Extract a **shared `governance` abstraction** (the interception contract + audit emit point) so `fintech` and the later `defense` package implement the same surface and never drift.
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

### Phase 6 — Defense Logistics (Use Case 2 — Procurement) *(new `packages/defense`)*
**Design hand-off:** NSN classification rules, CAC cryptographic-signature gate, `<SecureRequisitionDialog>` anatomy.
**Goal:** Second governance domain, proving the architecture generalizes beyond fintech.
- New `packages/defense` (pure Zod, **built on the shared `governance` abstraction** like `fintech`): cross-reference NSN → restricted classification.
- Build `<SecureRequisitionDialog>` — physically cannot execute until CAC signature is provided.
- Re-run the adversarial harness with restricted-item streams in the playground.
- **Exit criteria:** restricted-item order stream is dropped; governed requisition dialog enforced.

### Phase 7 — Marketing Site & Docs (`apps/web`)
**Design hand-off:** bespoke landing layouts, narrative, live demo embeds.
**Goal:** Public face — landing page + documentation, reusing `theme` (and read-only demos of `core`).
- Build landing layouts consuming `theme`; embed the governance demo.
- Document the architecture, boundaries, and how to add a new governed domain.
- **Exit criteria:** site builds and deploys to Cloudflare Pages.

### Phase 8 — Release Hardening
**Goal:** Publishable, versioned, CI-gated.
- Versioning/release flow (changesets) for `@sina-design-system/*` packages.
- CI: typecheck + lint + `vitest` schema tests + axe a11y checks + playground adversarial suite (mock mode) on every PR.
- Wire the **audit trail** to a real sink (replacing the Phase 3 stub).
- **Exit criteria:** packages publishable; adversarial suite + axe checks are required checks; audit events land in a real sink.

---

## 3. Playground × AI SDK — When & Where (explicit)

The `apps/playground` Adversarial Sandbox is the **only** place the Vercel AI SDK (`streamUI`) is integrated and tested. It is used:

| Phase | What the playground tests against schemas |
|---|---|
| **Phase 2** | Renders `core` primitives in isolation (no AI yet) — visual/a11y sanity. |
| **Phase 4 ★** | **Primary AI SDK integration.** Wires `streamUI` → interception layer → `fintech` schemas → governed render. Builds the adversarial input panel. |
| **Phase 5** | Runs the `<SecureWireDialog>` loop end-to-end against hostile $60k streams. |
| **Phase 6** | Re-runs the harness with `defense` schemas and restricted-NSN streams. |
| **Phase 8** | The adversarial suite becomes a required CI check. |

**The interception seam (the heart of SINA), exercised in Phase 4:**
```
LLM stream (streamUI intent / tool payload)
        │
        ▼
[ fintech/defense Zod schema .safeParse ]   ← the Constitution
        │
   ┌────┴────┐
 PASS       FAIL
   │           │
 render      BLOCK stream → force governed primitive
 core         (SecureWireDialog / SecureRequisitionDialog)
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
- `packages/defense/*` (new), `apps/web/app/page.tsx`

---

## 5. Verification

Per phase, "done" means:
- **Build green:** `pnpm build && pnpm typecheck && pnpm lint` clean across the workspace.
- **Theme (P1):** change a token → value propagates to both apps.
- **Core (P2):** keyboard/focus-trap/screen-reader checks pass **and automated axe checks are green** on primitives in the playground.
- **Schemas (P3):** `vitest` over valid + adversarial fixtures; `.safeParse` returns typed `{valid, violations, requiredComponent}`; each decision emits an audit event.
- **Interception (P4–P6) — the real test:** run the playground (`pnpm dev`, port 3001) in **mock mode**, feed a $60,000 transfer stream → assert the raw confirm is **blocked**, the designed blocked state shows, and `<SecureWireDialog>` renders; feed a compliant $5,000 stream → assert the standard primitive renders. Repeat for restricted-NSN streams → `<SecureRequisitionDialog>`. Confirm validation is server-side (§1b).
- **CI (P8):** adversarial suite (mock mode) + axe checks are required checks on every PR.

---

## Next Step

Begin **Phase 0 — Foundation Audit & Wiring** followed immediately by **Phase 0.5 — Agentic Workflow Setup** (`CLAUDE.md`, skills, hooks). Both are design-independent and unblock everything else. Phase 1 (Theme) then starts the design-hand-off loop and needs the first sign-off: the token set.
