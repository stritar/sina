/**
 * Canned healthcare + defense scenarios and the browser-side "gate" that plays
 * them back. No constitution exists for these industries yet, so these are
 * openly labeled simulations (the UI shows a persistent "Simulated preview"
 * tag): plain data, no Zod, no new industry packages. The cited regulations are
 * real, but nothing here enforces them; they illustrate where SINA would come in.
 */

import { prettyJson, type EmulatorTrace, type SimulatedScenario } from "./types";

export const HEALTHCARE_SCENARIOS: SimulatedScenario[] = [
  {
    id: "chart-ssn",
    chip: "Pull the full chart, with SSN",
    expected: "reject",
    prompt: "Pull up the full chart for Maria Chen, include her SSN so I can verify.",
    intent: "show_patient_chart",
    summary: "A chart view carrying an unmasked SSN. More than the minimum necessary.",
    intentJson: prettyJson({
      intent: "show_patient_chart",
      props: {
        patient: { id: "pt_4821", name: "Maria Chen" },
        fields: ["vitals", "allergies", "medications"],
        ssn: "543-21-6789",
      },
    }),
    result: {
      verdict: "reject",
      mount: null,
      violations: [
        {
          code: "PHI_MINIMUM_NECESSARY",
          severity: "reject",
          message:
            "An unmasked SSN may not render in a chart view. Only the minimum necessary data may be shown.",
          standard: "HIPAA 45 CFR 164.502(b)",
        },
      ],
    },
  },
  {
    id: "medication-list",
    chip: "Show the medication list",
    expected: "pass",
    prompt: "Show Maria Chen's current medication list.",
    intent: "show_medication_list",
    summary: "A routine read. Patient identifiers stay masked.",
    intentJson: prettyJson({
      intent: "show_medication_list",
      props: {
        patient: { id: "pt_4821", name: "Maria Chen" },
        medications: [
          { name: "Lisinopril", dose: "10 mg", schedule: "daily" },
          { name: "Metformin", dose: "500 mg", schedule: "twice daily" },
        ],
      },
    }),
    result: { verdict: "pass", mount: "MedicationList", violations: [] },
  },
  {
    id: "high-dose-order",
    chip: "Order 12 mg hydromorphone IV",
    expected: "escalate",
    prompt: "Order 12 mg hydromorphone IV for the patient in room 12.",
    intent: "order_medication",
    summary: "A medication order far above the usual dose for a high alert drug.",
    intentJson: prettyJson({
      intent: "order_medication",
      props: {
        patient: { id: "pt_4821" },
        drug: "hydromorphone",
        dose: { amount: 12, unit: "mg" },
        route: "IV",
      },
    }),
    result: {
      verdict: "escalate",
      mount: "CoSignDialog",
      violations: [
        {
          code: "HIGH_ALERT_DOSE_COSIGN",
          severity: "escalate",
          message:
            "The dose is above the high risk threshold for this drug. A pharmacist must co-sign the order.",
          standard: "ISMP high alert list",
        },
      ],
    },
  },
];

export const DEFENSE_SCENARIOS: SimulatedScenario[] = [
  {
    id: "munitions-transfer",
    chip: "Draft a munitions transfer",
    expected: "escalate",
    prompt: "Draft the transfer order for 40 cases of 5.56 to Depot B.",
    intent: "transfer_munitions",
    summary: "A munitions movement. One person may draft it; one may never execute it.",
    intentJson: prettyJson({
      intent: "transfer_munitions",
      props: {
        item: { nsn: "1305-01-155-5459", description: "5.56mm ball" },
        quantity: { cases: 40 },
        from: "Depot A",
        to: "Depot B",
      },
    }),
    result: {
      verdict: "escalate",
      mount: "DualAuthDialog",
      violations: [
        {
          code: "TWO_PERSON_CONTROL",
          severity: "escalate",
          message:
            "Munitions transfers require two person control. A second authorized officer must approve before the order is issued.",
          standard: "AR 190-11",
        },
      ],
    },
  },
  {
    id: "convoy-manifest",
    chip: "List the convoy manifest",
    expected: "pass",
    prompt: "List tomorrow's convoy manifest for route Kestrel.",
    intent: "show_convoy_manifest",
    summary: "A manifest read. One row sits above the viewer's clearance.",
    intentJson: prettyJson({
      intent: "show_convoy_manifest",
      props: {
        route: "Kestrel",
        viewerClearance: "confidential",
        rows: [
          { item: "Rations, 300 cases", classification: "unclassified" },
          { item: "Comms equipment", classification: "confidential" },
          { item: "Guidance modules", classification: "secret" },
        ],
      },
    }),
    result: {
      verdict: "pass",
      mount: "ManifestTable",
      violations: [
        {
          code: "CLEARANCE_ROW_WITHHELD",
          severity: "flag",
          message:
            "One export controlled row was withheld for this clearance level, and the omission was logged.",
          standard: "ITAR 22 CFR 120",
        },
      ],
    },
  },
  {
    id: "manifest-export",
    chip: "Email the manifest outside",
    expected: "reject",
    prompt: "Email the full manifest to the contractor's personal address.",
    intent: "export_manifest",
    summary: "An export of controlled data to an unaccredited destination.",
    intentJson: prettyJson({
      intent: "export_manifest",
      props: {
        manifest: "route-kestrel-full",
        destination: "contractor@gmail.com",
        includeClassified: true,
      },
    }),
    result: {
      verdict: "reject",
      mount: null,
      violations: [
        {
          code: "EXPORT_CONTROL_BOUNDARY",
          severity: "reject",
          message: "Export controlled data cannot leave the accredited boundary. The request was blocked and logged.",
          standard: "ITAR 22 CFR 120",
        },
      ],
    },
  },
];

export const HEALTHCARE_DEFAULT = "chart-ssn";
export const DEFENSE_DEFAULT = "munitions-transfer";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Play a canned scenario back as if a gate had run: a little latency jitter so
 * the stage feels alive (collapsed to zero under reduced motion), a small fake
 * per-decision latency, and `simulated: true` stamped on the trace.
 */
export async function simulate(
  scenario: SimulatedScenario,
  reducedMotion: boolean,
): Promise<EmulatorTrace> {
  await sleep(reducedMotion ? 0 : 500 + Math.random() * 400);
  return {
    intent: scenario.intent,
    verdict: scenario.result.verdict,
    mount: scenario.result.mount,
    violations: scenario.result.violations,
    latencyMs: Math.round(8 + Math.random() * 12),
    simulated: true,
  };
}
