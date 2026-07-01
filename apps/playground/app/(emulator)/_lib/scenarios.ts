/**
 * Emulator scenario catalog — the canned intents the playground feeds through the
 * gate. Sourced from the fintech constitution's own fixtures so the demo and the
 * CI suite exercise the exact payloads the schema is tested against (one source of
 * truth: a drift in the schema breaks the fixtures, which breaks the demo).
 *
 * Used by the scenario picker (Composer), the deep-link (`?scenario=<id>`), and
 * the gate's CI proof. Design-independent: pure data, no React.
 */

import { wireFixtures } from "@sina-design-system/fintech";

/** What the gate is expected to do — drives picker hints and the CI assertions. */
export type Expectation = "pass" | "escalate" | "reject";

export interface Scenario {
  id: string;
  label: string;
  description: string;
  payload: unknown;
  expectation: Expectation;
  /** Natural-language phrasing for live mode (sent to the model). */
  prompt?: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "small",
    label: "$500 — clean pass",
    description: "Fully-formed SEPA transfer below every regulatory band.",
    payload: wireFixtures.validSmallTransfer,
    expectation: "pass",
  },
  {
    id: "five-thousand",
    label: "$5,000 — compliant (SAR flag only)",
    description: "Travel Rule satisfied; trips an informational SAR flag but still mounts.",
    payload: wireFixtures.validFiveThousand,
    expectation: "pass",
    prompt: "Wire $5,000 from Acme Corp to Beta LLC for invoice 1042.",
  },
  {
    id: "over-limit",
    label: "$60,000 — over the $50k approval limit",
    description:
      "Full info, but above the secondary-approval threshold → escalate to SecureWireDialog.",
    payload: wireFixtures.overLimitTransfer,
    expectation: "escalate",
    prompt: "Wire $60,000 from Acme Corp to Beta LLC right away.",
  },
  {
    id: "travel-rule",
    label: "$4,000 — Travel Rule info missing",
    description: "Creditor address absent above $3k → escalate.",
    payload: wireFixtures.travelRuleMissingInfo,
    expectation: "escalate",
  },
  {
    id: "approved-sixty",
    label: "$60,000 — approved by a second manager",
    description:
      "Above the $50k limit but carries a valid secondary approval, bound to the exact terms → passes.",
    payload: wireFixtures.validApprovedSixtyThousand,
    expectation: "pass",
  },
  {
    id: "self-approval",
    label: "$60,000 — self-approved",
    description:
      "The initiator approves its own wire (approver === initiator) → hard reject (four-eyes).",
    payload: wireFixtures.selfApprovedSixtyThousand,
    expectation: "reject",
  },
  {
    id: "approve-five-execute-sixty",
    label: "Approve $5k, execute $60k",
    description:
      "An approval bound to $5k terms attached to a $60k wire → payload-binding mismatch, reject.",
    payload: wireFixtures.approveFiveExecuteSixty,
    expectation: "reject",
  },
  {
    id: "non-usd-large",
    label: "€60,000 — non-USD (bands not applied)",
    description: "Format-valid; the USD regulatory bands don't apply, so it passes.",
    payload: wireFixtures.validNonUsdLarge,
    expectation: "pass",
  },
  {
    id: "fabricated-confirm",
    label: "Fabricated Confirm button",
    description: "A smuggled `confirmButton` key → .strict() reject.",
    payload: wireFixtures.fabricatedConfirmButton,
    expectation: "reject",
  },
  {
    id: "smuggled-card",
    label: "Smuggled card data (CVV)",
    description: "A smuggled `cvv` → .strict() reject; dropped from the audit log.",
    payload: wireFixtures.smuggledCardData,
    expectation: "reject",
  },
  {
    id: "malformed-iban",
    label: "Malformed IBAN",
    description: "IBAN fails the mod-97 checksum → hard reject.",
    payload: wireFixtures.malformedIban,
    expectation: "reject",
  },
  {
    id: "non-integer",
    label: "Non-integer amount",
    description: "Minor units must be an integer → hard reject.",
    payload: wireFixtures.nonIntegerAmount,
    expectation: "reject",
  },
  {
    id: "unsupported-currency",
    label: "Unsupported currency",
    description: "Currency outside the ISO 4217 allow-list → enum reject.",
    payload: wireFixtures.unsupportedCurrency,
    expectation: "reject",
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
