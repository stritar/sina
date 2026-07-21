# SINA Design System — a developer review from a real integration

A field report from integrating [SINA](https://sinahub.app/docs) (v0.1.0, all five
packages) into PennyPinchr as an A/B test bed: a runtime toggle where **OFF** is the
app's original home-grown generated-UI pipeline, and **ON** is SINA's full
intent → server gate → governed-component protocol. Everything below was observed while
actually installing and wiring the system — not from reading the docs alone.

---

## 1. What was integrated

- **App**: React 19 + Vite 8 + Tailwind v4 + Express 5 chat prototype where an AI renders
  financial UI. OFF mode: the model returns a zod-validated JSON component tree.
- **ON mode**: the model emits *intent verbs* (never components); an Express-side gate
  runs SINA's `evaluateFintechIntent` (with one custom EUR rule, §5); only validated
  decisions mount `@sina-design-system/fintech-react` components; escalations run the
  real approval loop against a `/api/sina/regate` endpoint; every decision emits a
  redacted audit event to the server log.
- Both providers pass the same gate: the Claude path via `/api/chat`, and even the
  browser-local mock provider round-trips its intents through `/api/sina/gate`, because
  SINA's rule is "validation runs on the server only".

## 2. Installation log

| Step | Result |
|---|---|
| `npm install` of all 5 packages | **~10 s, zero errors, zero peer warnings** (33 new packages). React 19 peer ranges correct (`^18.2.0 \|\| ^19.0.0`). |
| Stylesheet wiring | 4 CSS imports as documented. The reset is `@layer`-ed and every token is `--sina-*`-prefixed — **zero collisions** with the app's existing Tailwind v4 `@theme` setup; OFF mode is visually untouched with the CSS statically imported. |
| Server import (`tsx`, Express 5, Node ESM) | Imports cleanly. No interop workarounds. |
| zod versions | SINA bundles zod **3**; the app uses zod **4**. Coexists fine — nothing crosses the boundary except plain JSON. Good layering. |
| TypeScript | One papercut: `import '@sina-design-system/theme/css'` fails TS's side-effect-import check because the subpath doesn't end in `.css` (needed a one-line `declare module`). Vite resolves it fine. |
| Bundle cost (production, minified) | JS **1,110 kB → 1,491 kB** (+381 kB; gzip 332 → 447 kB), CSS **34 kB → 136 kB** (+102 kB; gzip 7 → 20 kB). Driver: `core` hard-depends on `chart.js` + `react-chartjs-2` + `radix-ui` + `@phosphor-icons/react`. |

Worth knowing before you install: if you only want the governance layer,
`governance` + `fintech` are genuinely dependency-light (zod only). The layering
discipline advertised in the docs ("never contains React/UI") is real and verifiable in
each package.json.

## 3. Docs vs. reality

The docs are unusually honest for a 0.1.0 — almost everything checked out against the
shipped `.d.ts`. Differences and omissions found:

| Docs say | Package reality |
|---|---|
| "28 accessible components" | `core` exports 29 primitives; `fintech-react` exports **30** (3 governed + 27 display). The docs' intent table lists ~25 verbs; the shipped `INTENTS` registry has **49**. The real surface is bigger than documented. |
| Quickstart: 5 packages + CSS order | Correct, including the "reset is layered, your styles win" claim (verified). |
| Packages page: styles at `./dist/styles.css` | The actual export subpath is `./styles.css`. Minor, but a copy-paste from that page fails. |
| "wire above $50,000 requires secondary approval" | True — **for USD only** (§5). The headline "$60k wire" example silently assumes USD. |
| Intent → component table | Matches the registry exactly. But the docs never state that **governed verbs mount `null` on a clean pass** — the host app must supply its own "approved, now confirm" step. Only discoverable in `router.d.ts`. |

The `/llms.txt` + per-page `/llms/docs/*.md` mirrors are genuinely useful for an
AI-assisted install — this integration's agent consumed them directly.

## 4. Protocol DX ("validate, then mount") — the good part

This is where SINA earns its pitch. Observed while wiring the gate:

- `evaluateFintechIntent({intent, props})` → `{intent, props, result, mount}` is a
  pleasant single entry point. Unknown verbs come back as a normal decision
  (`UNKNOWN_INTENT`), not an exception — **refusal-as-data** keeps the render path
  uniform: one component renders allowed, escalated, and refused outcomes.
- `.strict()` schemas do exactly what the pitch promises. A smuggled
  `confirmButton: true` on an otherwise-valid wire is a `SCHEMA_INVALID` reject;
  we verified this end-to-end from the mock's adversarial scenario through the HTTP gate.
- **IBAN checksums are real.** SINA validates ISO 13616 mod-97 — which caught that two
  of our made-up seed IBANs were invalid. Annoying for five minutes, then exactly the
  kind of correctness you want from a fintech constitution (the citation is in the
  violation message).
- The approval loop primitives (`payloadHash`, `coreTerms`, `actionHash`) are exported,
  deterministic, and documented in-source. The binding hash is recomputed server-side
  and never trusted from the stream, so the "approve $5k, execute $60k" attack is
  structurally dead — and `SELF_APPROVAL_FORBIDDEN` (four-eyes against the server-known
  initiator, not a payload field) worked first try.
- `setAuditSink` is one line; every intercepted intent emits a redacted event
  (IBANs hashed, second factors dropped) with the deciding component and rule version.
- The registry being a plain `Record<string, PatternEntry>` **factory** (context bound
  per call, never frozen at import) made extending it a spread — see §5.

The manifest → LLM tool definition step is the weakest link: `fintechIntentManifest()`
returns prose summaries, so the per-intent props documentation in our system prompt had
to be hand-written (the in-source comment admits JSON-schema export is deferred).

## 5. The EUR problem — biggest finding

`makeWirePolicy` short-circuits: **`if (data.currency !== "USD") return violations;`**
Every band (Travel Rule, SAR, CTR, the $50k dual-control) is skipped for the other seven
currencies the schema happily accepts. The in-source comment says it's by design ("FX
equivalence is deferred") — but PennyPinchr is a EUR bank, and out of the box a
**€60,000 wire returned `valid: true` with zero violations**. That is precisely the
silent pass the system exists to prevent, and nothing at the API surface warns you.

**What SINA gets right**: fixing this inside SINA's own idiom took ~40 lines
([server/sina/eur-wire-rule.ts](../server/sina/eur-wire-rule.ts)), because everything
needed is exported: `intercept`, `approvedWireTransferPayload`, `makeWirePolicy` (chained
so USD behavior is preserved), `payloadHash`/`coreTerms` for the approval binding, and
the threshold constants. The custom rule mirrors the dual-control band at EUR par and
keeps SINA's own escalation code + component mapping, per the "write a governance rule"
guide's conventions. The extension surface is real — but the default is a foot-gun.

## 6. Component DX

- The three governed dialogs have **exactly the right callback surface**:
  `onSubmitApproval(evidence) => Promise<{approved, violations}>` + `onApproved`.
  The component never validates and never computes the hash — you *cannot* wire it up
  insecurely by accident, because the binding APIs only exist server-side. A denied
  re-gate keeps the dialog open, as advertised.
- Display components take a single `payload: unknown` — the gated payload. No prop
  drilling; the flip side is TypeScript gives you nothing at the call site. You trust
  the gate (which is the point, but per-intent payload types would be nice — §8).
- Default `triggerLabel` renders as literal "Open SecureWireDialog" — you'll always
  override it.
- Small data adapters were unavoidable (~15 lines per display verb, server-side): the
  app's signed `amountCents`/`categoryId` rows → SINA's `amount`+`direction`/`postedAt`
  shape; masked numbers must match `/^\*{2,}\d{2,4}$/`; `list_cards` requires
  `network` + `expiry` our cards don't have (synthesized); SEPA accounts require BICs
  our seed lacked (synthesized, format-checked).

## 7. Gaps & work SINA leaves to the app

- **Display data sourcing is your job.** Display payloads carry the actual rows; SINA
  guarantees *shape and provenance*, not truth ("apps must source props from trusted
  tools, not model free-text" — in-source docs). Our server resolves display payloads
  from the bank store; the model only ever sends selection hints. This is the right
  boundary, but the docs could be far louder about it — a naive integrator will let the
  model author the rows, which validates fine and defeats the purpose.
- **Clean-pass governed actions render nothing** (`mount: null`). The app composes its
  own confirm step from `core` primitives and executes against its own store.
- **No verb** for generic layout trees, arbitrary charts, or a disambiguation
  button-group ("which Alex?"). ON mode steers these to message + suggestion chips —
  fine for a bank assistant, but the OFF-mode system is strictly more expressive here.
- The demo bank models only active/frozen cards, so an approved cancel/replace is
  simulated as a freeze.

## 8. Proposed improvements (ranked)

1. **Make the USD-only policy loud.** Emit a `flag` violation (e.g.
   `POLICY_BANDS_NOT_EVALUATED`) for non-USD currencies instead of silently returning
   `valid: true`, and say it on the page where the $60k example lives. This is the one
   change that separates "governance" from "governance theater" for non-US integrators.
2. **Ship per-intent JSON Schemas in the manifest** (planned per in-source comment).
   Today the LLM tool definition and prompt props docs must be hand-authored, which is
   exactly the place a typo silently degrades the whole protocol.
3. **Export per-intent payload TypeScript types keyed by verb**
   (`IntentPropsMap['wire_transfer']`) and type display components' `payload`
   accordingly — the client side is currently all `unknown`.
4. **Document the clean-pass `mount: null` contract for governed verbs** — the first
   thing every integrator hits, currently only discoverable in `router.d.ts`.
5. **Document the display-provenance rule in the main docs**, not just in-source: "the
   server builds display payloads; the model sends hints" deserves a worked example.
6. **A `core`-lite entry** without chart.js/phosphor (+483 kB minified is a lot if you
   want governance + a dialog), and fix the packages page's `./dist/styles.css` path;
   consider naming the theme export `./theme.css` so TS treats it as a stylesheet.
7. **Nicer default `triggerLabel`s** for the governed dialogs.

## 9. Verdict

| Dimension | Score | Notes |
|---|---|---|
| Install effort | **9/10** | 10 seconds, zero warnings, CSS isolation as advertised. Best-in-class for a 0.1.0. |
| Docs accuracy | **7/10** | Honest and mostly verified; the real surface is bigger than documented; two discoverability gaps (clean-pass mounts, display provenance). |
| Protocol fidelity | **9/10** | Strict schemas, refusal-as-data, server-recomputed binding hashes, four-eyes, redacted audit — all real and all testable. |
| Fit for non-US fintech | **4/10** | USD-only bands silently no-op; fixable via the (excellent) extension surface, but the default is dangerous. |
| Would adopt? | **Yes, for AI-generated UI in regulated domains** — specifically for the governance layer. As a plain component library it's competent but heavy; the gate is the product. |

The A/B comparison this repo now embodies: OFF mode trusts a zod allowlist of
components; ON mode trusts nothing the model says — and the difference is visible the
moment you ask for a €60,000 transfer.

## Appendix A — verification script

1. `npm run dev`, toggle **OFF** (default): app identical to before (chat, `/components`,
   saved conversations load; `/api/chat` payload unchanged).
2. Toggle **ON** (header switch → "governed" badge), mock provider:
   - "Show my latest transactions" → SINA `TransactionList` with real seed rows.
   - "Show my account balances" → `AccountList`; "Show my spending this month" → `SpendingBreakdown` pie.
   - "Transfer €250 to Alex" → disambiguation via suggestions; pick Alex Berger → gate-approved confirm card → send → balance drops (ask for balances again to see).
   - "Transfer €60,000 to Alex Berger" → **escalation**: `SecureWireDialog`; approve as e.g. `mgr_maya / Maya Chen / 123456` → approved → executed. Enter approver id `agent:opus` instead → `SELF_APPROVAL_FORBIDDEN`, dialog stays open.
   - "Cancel my debit card" → `GovernedActionDialog` (second-factor re-auth).
   - "fabricate a transfer" → smuggled-field demo → `SCHEMA_INVALID` refusal with citation.
   - Server terminal shows one `[sina:audit]` JSON line per gated intent (IBANs hashed).
   - Expand "SINA-governed · View decision JSON" under any answer to see the raw gate output.
3. Toggle **ON**, Claude provider (`VITE_AI_PROVIDER=claude` + API key): free-form
   requests ("send sixty grand to alex") produce the same gated outcomes; unmappable
   asks steer to message + suggestions.
4. Toggle OFF mid-conversation: old SINA messages still render governed, new ones use
   the classic renderer; survives reload.
5. `npm test` (30 tests, incl. gate + renderer suites), `npm run lint`, `npm run build` — all green.

## Appendix B — simplifications made in this integration

- The "secondary approver" is the same human filling in the dialog (single-user demo).
  The server still enforces four-eyes against the *agent* initiator id (`agent:opus`),
  so the mechanism — binding hash + separation of duties — is fully exercised.
- EUR policy bands mirror SINA's USD constants at par (1 : 1), citing the deviation in
  the violation's `standard` field.
- Approved `cancel`/`replace` card actions are simulated as a freeze (the demo bank has
  no canceled state).
- Two seed IBANs were corrected (check digits only) to satisfy SINA's mod-97 validation.
