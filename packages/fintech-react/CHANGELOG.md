# @sina-design-system/fintech-react

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

### Patch Changes

- Updated dependencies [8ee02d2]
  - @sina-design-system/fintech@0.2.0
  - @sina-design-system/theme@0.2.0
  - @sina-design-system/governance@0.2.0
  - @sina-design-system/core@0.2.0

## 0.1.0

### Minor Changes

- d1de066: Initial public release of the SINA packages: design tokens (`theme`), headless
  accessible primitives (`core`), the governance seam (`governance`), the Fintech
  constitution (`fintech`), and the governed components (`fintech-react`). Bumps
  `0.0.0 → 0.1.0`.

### Patch Changes

- Updated dependencies [d1de066]
  - @sina-design-system/theme@0.1.0
  - @sina-design-system/core@0.1.0
  - @sina-design-system/governance@0.1.0
  - @sina-design-system/fintech@0.1.0
