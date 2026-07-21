---
"@sina-design-system/fintech": minor
"@sina-design-system/fintech-react": minor
"@sina-design-system/theme": minor
"@sina-design-system/governance": minor
"@sina-design-system/core": minor
---

Second round of fixes from the PennyPinchr integration review (SINA_UPSTREAM_REPORT).

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
