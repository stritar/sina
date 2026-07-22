# @sina-design-system/governance

## 0.3.0

### Minor Changes

- 0847a06: Second round of fixes from the PennyPinchr integration review (SINA_UPSTREAM_REPORT).

  **fintech**

  - **Step-up enforcement no longer skips four-eyes + binding outside `approval`
    mode.** `stepUpViolations` now verifies the payload-binding hash whenever an
    authorization supplies one, and rejects self-approval whenever an `approverId`
    is supplied, in **every** `StepUpMode` (previously both ran only in `approval`
    mode). This closes a gap where the ten `second-factor` schemas (card-control,
    security-change, kyc, place-trade, p2p-payment, add-user, dispute,
    link-account, add-payee, issue-card) cleared on any 6-digit code while the
    `GovernedActionDialog` UI promised "the initiator cannot authorize their own
    action" and "binds to the exact terms". A step-up whose `approverId` is the
    initiator now returns `SELF_APPROVAL_FORBIDDEN`; a mismatched `payloadHash`
    returns `APPROVAL_PAYLOAD_MISMATCH`. A bare `{ secondFactor }` (no approver, no
    hash) still passes, and `acknowledge` is unaffected. Behavior change: code
    asserting an empty `violations` array on a self-approved or unbound
    `second-factor` payload will now see a reject.
  - `approvalViolations` is now **exported** — the un-bypassable wire dual-control
    core (binding hash + separation of duties), so a non-USD integrator can reuse
    it instead of copying it by hand.
  - `makeWirePolicy` and `evaluateWireTransfer` accept an optional `bands`
    (`WireBand[]`) on their context: a non-USD wire can opt into the
    secondary-approval band at its own par. The USD-cited Travel-Rule / SAR / CTR
    bands remain USD-only and still attach `POLICY_BANDS_NOT_EVALUATED`. New
    `WireBand` / `WirePolicyContext` exports. The approval-escalation message is now
    currency-neutral (no hardcoded "$50,000").

  **fintech-react**

  - **Locale support.** New `FintechLocaleProvider` + `useFintechLocale`: money,
    date, and percent formatting now honor a host locale instead of hardcoding
    `en-US`. `formatAmount` / `formatDate` / `formatPct` / `deriveActionTerms` take
    an optional trailing `locale`, and every formatting component takes an optional
    `locale` prop that overrides the provider. Defaults to `en-US`, so existing
    output is unchanged.
  - `SecureWireDialog` fallback review copy no longer hardcodes "$50,000" — it is
    currency-neutral by default and accepts an optional `thresholdLabel` prop.
  - `SecureWireDialog` renders a bounded error state ("This wire could not be
    read") when a payload is missing its required money terms, instead of a
    plausible-wrong `$0.00`. `readWire` now reports absent required terms via
    `missing: string[]`.

## 0.2.0

### Minor Changes

- 8ee02d2: Improvements from the PennyPinchr integration review (SINA_REVIEW.md).

  **fintech**

  - **Non-USD payloads are no longer a silent pass.** All nine money-movement
    policies (wire, ACH, P2P, bill pay, recurring, FX, crypto withdraw, cash
    withdraw, change limit) now attach one informational
    `POLICY_BANDS_NOT_EVALUATED` violation (`severity: "flag"`, cited as
    "SINA policy — USD-only bands") when `currency !== "USD"`. `valid` is
    unchanged (a flag never blocks), but code asserting an empty `violations`
    array on a non-USD pass will now see one entry. Constitution versions bumped
    (wire 1.2.0, siblings 1.1.0); new `sina-usd-scope` standards-catalog entry.
  - `fintechIntentManifest()` entries now carry `propsSchema`: the verb's payload
    as a self-contained JSON Schema derived (via `zod-to-json-schema`) from the
    exact Zod object the gate runs. Drop it straight into an LLM tool definition.
  - New `IntentPropsMap` / `IntentProps<"verb">` exports: every intent verb keyed
    to the payload type its rule gates, compile-time-bound to the new
    `INTENT_SCHEMAS` map.
  - New ungoverned display verb `clarify_choice` (disambiguation: "which Alex?"),
    with schema, fixtures, registry + manifest entries.
  - `list_cards`: `network` and `expiry` are now optional; wire SEPA legs accept
    an IBAN without a BIC (the SEPA IBAN-only rule). Integrators no longer have
    to synthesize data to satisfy the shape.

  **fintech-react**

  - New `ClarifyChoice` display component (`onSelect` emits a selection hint).
  - `CardList` omits the network/expiry row when the fields are absent.
  - `SecureWireDialog` default `triggerLabel` is now "Review wire transfer"
    (was the literal "Open SecureWireDialog").
  - Every display component's `payload` prop documents its `IntentPropsMap` key.

  **theme**

  - New `./theme.css` export subpath (alias of `./css`) so a TypeScript
    side-effect import resolves without a `declare module` workaround.

## 0.1.0

### Minor Changes

- d1de066: Initial public release of the SINA packages: design tokens (`theme`), headless
  accessible primitives (`core`), the governance seam (`governance`), the Fintech
  constitution (`fintech`), and the governed components (`fintech-react`). Bumps
  `0.0.0 → 0.1.0`.
