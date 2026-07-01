---
name: new-display-pattern
description: Scaffold an UNGOVERNED fintech display pattern — a shape-only fintech schema (no policy/escalation) composed with a presentational fintech-react component, routed by the intent registry and mounted on a clean pass. Use when asked to "add a read/display pattern", "show a transaction list / balance / holdings", or add an ungoverned agentic-UI experience.
---

> **The ungoverned twin of `/new-schema` + `/new-governed-component`.** `TransactionList` and
> `BalanceCard` are the canonical worked examples — copy their shape. The governed path
> (`SecureWireDialog`) stays as-is; this is for reads that carry no money-movement/compliance risk.

Scaffold a new **ungoverned** fintech pattern: an LLM intent like "show my last 2 transactions"
that SINA **validates-then-mounts** as a presentational component. The invariant still holds — the
read is shape-validated server-side before anything renders — there is just no policy and no
escalation.

## The model

Every intent is validated-then-mounted; governance is an optional layer. An ungoverned pattern =
a `ConstitutionRule` with a **schema but no `policy` and no `escalations`** + a `component` name.
On a clean pass the router (`@sina-design-system/governance` `dispatch`) resolves
`mount = rule.component` and the playground mounts the presentational component. The read is still
audited (`decidedComponent` records what mounted).

## Two boundaries you must keep

1. **Displays are read-only.** The component renders validated props and offers **no write action**.
   Any action (repeat a payment, dispute) must emit a **new intent** through the gate via an
   `onIntent?(envelope)` callback — never a raw button. This is the whole point of the ungoverned/
   governed split; a money-moving button inside a display bypasses the constitution.
2. **Shape, not truthfulness.** SINA validates the payload's shape + provenance, not that the data
   is real or its free-text safe. `.strict()` blocks fabricated keys/actions; the component renders
   free text as **text, never `dangerouslySetInnerHTML`**. Apps source props from trusted tools.

## Recipe

1. **Shape-only schema** — `packages/fintech/src/<pattern>/<pattern>.schema.ts`:
   - `z.object({ … }).strict()`, nested objects/rows `.strict()` too (rejects smuggled row actions).
   - Amounts are **integer minor units** (`minorUnitAmount`); timestamps ISO (`z.string().datetime()`);
     reuse `formats/masked-account.ts` (`maskedAccountRef`) — a read never carries a full account/PAN.
   - **Bound every array** (`.max(N)`) so a hostile stream can't flood the client.
   - **No `policy`, no `escalations`.** Export `<PATTERN>_VERSION` and a `<PATTERN>_REDACTION`
     (`{ mask: ["maskedNumber"] }`) so the audited payload stays masked.
2. **Fixtures** — `packages/fintech/src/<pattern>/fixtures.ts`: a typed valid fixture (compile-time
   drift guard) + a typed **empty** fixture (valid empty state), plus `unknown` adversarial ones
   (smuggled row action → nested `.strict()`; non-integer amount; over-`.max()` flood; a markup
   string that **passes** — it documents the shape-vs-content boundary).
3. **Register the intent** — in `packages/fintech/src/registry.ts`: add an `INTENTS.<VERB>` and a
   `pattern({ rule: { schema, redaction, version, component: "<Component>" } })` entry in
   `fintechRegistry`, plus a `fintechIntentManifest()` row (`kind: "display"`). Re-export the schema
   + fixtures from `packages/fintech/src/index.ts`.
4. **Presentational component** — `packages/fintech-react/src/<Component>/<Component>.tsx`:
   - Compose `core` primitives (SummaryList/Stack/Badge/Separator/ScrollArea); format money via
     `format.ts` `formatAmount` and add a tolerant reader (`read<Pattern>`) next to `readWire`.
   - Props `{ payload: unknown; onIntent?: (envelope: IntentEnvelope) => void }`. Read defensively
     (never throw on a hostile shape); render an **empty state**; free text as **text**.
   - No `"use client"` unless it holds state; **no `zod`**, **no server actions**.
5. **A11y test** — `<Component>.test.tsx` (jsdom + jest-axe): zero violations on the valid fixture,
   correct item count, empty-state render, and **markup renders as text** (assert
   `container.textContent` contains the raw string and `querySelector("img")` is null).
6. **Playground scenario** — add the presentational name to `_lib/registry.tsx` `PRESENTATIONAL`,
   and add `_lib/scenarios.ts` entries (a valid read → `expectation: "pass"`, an adversarial →
   `"reject"`). Add a `gate.test.ts` assertion (`mount === "<Component>"`, audit emitted).
7. **Verify:** `CI=true pnpm --filter @sina-design-system/fintech build lint typecheck test`, then
   the same for `@sina-design-system/fintech-react`, then `playground`.
8. **Catalog + Figma:** flip the row to ✅ in `packages/fintech/PATTERNS.md`; sync the component to
   Figma via `/primitive-figma-sync` + `/figma-component-coverage`.

## Reuses

- `@sina-design-system/governance` — `dispatch`, `pattern`, `IntentEnvelope`, `RedactionConfig`.
- `packages/fintech`: `formats/*` (`minorUnitAmount`, `currencyCode`, `maskedAccountRef`),
  `registry.ts`, and the `transaction-list` / `account-balance` schemas as templates.
- `packages/fintech-react`: `format.ts` (`formatAmount`, `formatDate`, tolerant readers), and
  `TransactionList` / `BalanceCard` as component templates.

## Gotchas

- **Run pnpm with `CI=true`** (no-TTY modules-purge) and **sandbox-off** for tests (vitest `/tmp`
  EPERM; a fresh install can EPERM mid-extract and corrupt the store — reconcile with a reinstall).
  See [[pnpm-verify-deps-purge]], [[pnpm-install-sandbox-corruption]], [[playground-dev-sandbox-port]].
- **`IntentEnvelope`/`Decision`** are re-exported from `@sina-design-system/fintech` — import them
  from there, not `governance`, in app code.
- **Strict Tailwind grid** — off-grid utilities are silently dropped; use on-scale tokens (see
  [[sina-strict-tailwind-grid]]). Semantic border colors need the full token
  (`border-border-subtle`, see [[border-color-double-prefix]]).
- **Do not add a `policy`/`escalations`** to a display rule — that makes it governed. If the read
  turns out to need a limit or a confirm, it's a governed flow: use `/new-schema` +
  `/new-governed-component` instead.

## Scaffolds

`fintech/src/<pattern>/<pattern>.schema.ts`, `fintech/src/<pattern>/fixtures.ts`, the
`registry.ts` entry + `index.ts` re-exports, `fintech-react/src/<Component>/<Component>.tsx` +
`.test.tsx` + `format.ts` reader, and the playground `registry.tsx` + `scenarios.ts` + `gate.test.ts`
wiring, plus the `PATTERNS.md` status flip.
