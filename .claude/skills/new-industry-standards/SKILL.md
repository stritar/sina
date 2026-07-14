---
name: new-industry-standards
description: Give a new industry constitution package (defense, health, …) the same standards treatment as fintech — a cited Standard[] catalog, the bidirectional coverage guard, and a section on the one standards docs page. Use when asked to "add a new industry", "add the defense package", "document the standards for X", "which standards do we encode", or when the standards guard test fails.
---

> **The invariant:** an industry constitution package documents **every standard it encodes**, and the documentation is **derived from the code and guarded both ways** — a `standard:` a rule emits must appear in the catalog, and a catalog entry must cite something the code really checks. A new industry gets a `## <Industry>` **section** on the existing standards page, **never a new page**. This is the "Every industry documents the standards it encodes" rule in `CLAUDE.md`.

## The trap

A standards page is a **compliance claim**. Hand-written, it drifts the moment someone
adds a rule, and — worse — it launders gaps into guarantees. The worked example is real:
the docs advertised a *"Same Day ACH ceiling — $1,000,000 — Nacha"* while
`ACH_SAMEDAY_MAX_MINOR` sat unimported by any schema and `ach-transfer`'s own doc comment
promised a reject that did not exist. Three artifacts, three different stories. (Wiring it
in then exposed a second bug: the ACH ceiling was the *card-rail* `STRIPE_MAX_MINOR`
($999,999.99), **below** the Nacha limit — so the rule could never have fired anyway.)

The `enforcement` field is the antidote. It says what the code **actually does** — "IBAN
mod-97 checksum", "amount band, USD only", "field-name deny-list + audit redaction" —
never a compliance claim ("PCI compliant", "OFAC screened"). If the honest sentence is
embarrassing, that is information: fix the code or don't list the standard.

## The shape (fixed)

| Wrong | Right |
|---|---|
| A hand-written table in the `.mdx` | `<StandardsTable industry="…" />` rendering the package's catalog |
| A new `governance/standards/<industry>.mdx` page | A `## <Industry>` section on the one `governance/standards.mdx` |
| `enforcement: "PCI-DSS compliant"` | `enforcement: "cvv/PAN field deny-list + audit redaction — not a PCI assessment"` |
| Listing a standard you *intend* to enforce | Listing only what a rule cites today |

The `Standard` type and the two coverage helpers (`uncataloguedCitations`,
`uncitedStandards`) live in `@sina-design-system/governance` — domain-agnostic, so every
industry shares them. Only the **data** is per-industry.

## Recipe

1. **Write the catalog** `packages/<industry>/src/standards.ts` — `export const
   <INDUSTRY>_STANDARDS: Standard[]`. **Pure data, no `zod`, no schema imports**, so the
   docs can render it without pulling the constitution into a bundle. Model it on
   `packages/fintech/src/standards.ts`. Each entry: `id`, `name` (as cited), `authority`,
   `title`, `tier` (`format` | `regulatory` | `policy`), `enforcement` (**the honest
   mechanism**), `citations` (the exact strings the code contains), `where`, optional `url`.
   Keep `policy` entries explicitly labeled tunable defaults — **not law**.
2. **Export it on a subpath.** Add to `packages/<industry>/package.json`:
   `"./standards": { "types": "./dist/standards.d.ts", "default": "./dist/standards.js" }`,
   and re-export from `src/index.ts`.
3. **Add the guard** `packages/<industry>/src/standards.test.ts` — copy
   `packages/fintech/src/standards.test.ts` verbatim and swap the catalog import. It walks
   its own `src`, **excluding `standards.ts` itself** (the catalog cannot be its own
   evidence), and asserts four things: non-vacuity, unique ids, every emitted `standard:`
   is catalogued, every entry cites something in the source, and no `enforcement` string
   contains a compliance claim.
4. **Add the docs section.** In `apps/web/content/docs/governance/standards.mdx`, append a
   `## <Industry>` heading and `<StandardsTable industry="<slug>" />`. **Do not add a
   page** — the docs are capped at 20 prose pages and the table is JSX, so a section costs
   ~0 prose words while a page costs one of the last slots.
5. **Register the catalog** in the `CATALOGS` map of
   `apps/web/app/components/docs/visuals/StandardsTable.tsx`, and add the workspace dep to
   `apps/web/package.json` (`"@sina-design-system/<industry>": "workspace:*"`), then
   `pnpm install`.
6. **Rebuild `dist` before any visual check** (`/preview-change`) — `apps/web` consumes
   `dist`, not `src`, so the page renders a stale (or empty) catalog until the package is
   rebuilt.

## Reuses

- `packages/governance/src/standards.ts` — the `Standard` type + `uncitedStandards` / `uncataloguedCitations`.
- `packages/fintech/src/standards.ts` — the reference catalog (three tiers, honest `enforcement`).
- `packages/fintech/src/standards.test.ts` — the guard; copy it.
- `apps/web/app/components/docs/visuals/StandardsTable.tsx` — the renderer + the `CATALOGS` registry.
- `apps/web/content/docs/governance/standards.mdx` — the one home (canon row in `docs-canon.test.ts`).
- The `/new-schema` golden rule ("never invent a limit") — this rule is its receipt.

## Verify

```
CI=true pnpm --filter @sina-design-system/governance build
CI=true pnpm --filter @sina-design-system/<industry> build lint typecheck test   # the standards guard
CI=true pnpm --filter web test                                                   # budget/canon/links guards
```

Then prove the guard bites **both ways**: temporarily add `standard: "FINRA Rule 4210"` to
a rule → the package's tests fail as *uncatalogued*; temporarily add a catalog entry citing
a standard nothing implements → they fail as *uncited*. Revert both.

## Gotchas

- **A section, not a page.** `docs-budget.test.ts` caps prose pages at 20 (18 before this
  rule shipped). One page per industry breaks the build at the second or third one.
- **Exclude the catalog from its own guard.** If `standards.ts` is in the scanned source,
  every entry trivially "cites" itself and the uncited check passes vacuously.
- **A redirect can shadow the new URL.** `/docs/governance/standards` was a 301 into
  `/docs/governance`; `docs-links.test.ts` fails a rule whose `source` is a live page. Remove
  the row when a redirected path becomes real.
- **A `reject` still resolves a `requiredComponent`** if the payload also trips an
  `escalate` rule — `intercept` picks the first escalation regardless. `valid` stays `false`,
  which is what matters; don't assert `requiredComponent === null` on a payload that is also
  over an authorization band.
- **Don't invent a limit to make a row look good.** If nothing enforces a standard, the
  honest move is to leave it out — or implement it, with the citation in the code.
