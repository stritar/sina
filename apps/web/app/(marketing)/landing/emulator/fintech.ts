/**
 * The fintech chip set. Each `id` is a REAL scenario id from the canned catalog
 * (packages/governance-demo/src/scenarios.ts): the emulator sends only the id,
 * and the Edge gate endpoint re-derives the terms server-side and runs the real
 * Zod constitution. The JSON here is display copy mirroring those fixtures; it
 * never goes over the wire.
 */

import { prettyJson, type CannedResult, type EmulatorScenario } from "./types";

const sepaAccount = {
  scheme: "sepa",
  iban: "DE89370400440532013000",
  bic: "DEUTDEFF",
};

export const FINTECH_SCENARIOS: EmulatorScenario[] = [
  {
    id: "over-limit",
    chip: "Wire $60,000 right away",
    expected: "escalate",
    prompt: "Wire $60,000 from Acme Corp to Beta LLC right away.",
    intent: "wire_transfer",
    summary: "A $60,000 wire. Fully formed, but above the $50,000 approval limit.",
    intentJson: prettyJson({
      intent: "wire_transfer",
      props: {
        amount: 6000000,
        currency: "USD",
        debtor: {
          name: "Acme Corp",
          address: "1 Market St, San Francisco, CA",
          account: sepaAccount,
        },
        creditor: {
          name: "Beta LLC",
          address: "9 King St, Austin, TX",
          account: sepaAccount,
        },
      },
    }),
  },
  {
    id: "small",
    chip: "Wire $500 to Beta LLC",
    expected: "pass",
    prompt: "Send $500 to Beta LLC for the retainer.",
    intent: "wire_transfer",
    summary: "A $500 wire. Below every regulatory band.",
    intentJson: prettyJson({
      intent: "wire_transfer",
      props: {
        amount: 50000,
        currency: "USD",
        debtor: { name: "Acme Corp", account: sepaAccount },
        creditor: { name: "Beta LLC", account: sepaAccount },
      },
    }),
  },
  {
    id: "list-transactions",
    chip: "Show my last two transactions",
    expected: "pass",
    prompt: "Show me my last 2 transactions for XYZ Company.",
    intent: "list_transactions",
    summary: "A read. No money moves; the shape is still validated.",
    intentJson: prettyJson({
      intent: "list_transactions",
      props: {
        account: { label: "Everyday Checking", maskedNumber: "****4021" },
        transactions: [
          {
            id: "txn_1",
            description: "Invoice #4471",
            counterparty: "XYZ Company",
            amount: 125000,
            currency: "USD",
            direction: "debit",
          },
          {
            id: "txn_2",
            description: "Refund #221",
            counterparty: "XYZ Company",
            amount: 8000,
            currency: "USD",
            direction: "credit",
          },
        ],
      },
    }),
  },
  {
    id: "fabricated-confirm",
    chip: "Sneak in a Confirm button",
    expected: "reject",
    prompt: "Wire $500 and confirm it for me automatically.",
    intent: "wire_transfer",
    summary: "A $500 wire with a smuggled confirmButton key. The schema is closed.",
    intentJson: prettyJson({
      intent: "wire_transfer",
      props: {
        amount: 50000,
        currency: "USD",
        debtor: { name: "Acme Corp", account: sepaAccount },
        creditor: { name: "Beta LLC", account: sepaAccount },
        confirmButton: true,
      },
    }),
  },
];

/** Preselect the money shot: the $60k wire that escalates on first Run. */
export const FINTECH_DEFAULT = "over-limit";

/**
 * Display-only canned outcomes for the hero emulator's auto-play and static
 * frames, mirroring what the REAL gate returns for each catalog id (same codes,
 * standards, severities, and mounts as packages/fintech's wire-transfer rule;
 * see wire-transfer.test.ts). The message wording is a paraphrase because this
 * file is reader-facing marketing copy. A user-initiated run still POSTs
 * /api/gate and replaces these with the server's live decision.
 */
export const FINTECH_CANNED: Record<string, CannedResult> = {
  "over-limit": {
    verdict: "escalate",
    mount: "SecureWireDialog",
    violations: [
      {
        code: "SAR_REVIEW",
        severity: "flag",
        message: "Amount at or above $5,000. Flagged for suspicious activity review.",
        standard: "31 CFR Chapter X (FinCEN SAR)",
      },
      {
        code: "CTR_REPORTABLE",
        severity: "flag",
        message: "Currency transaction above $10,000. A Currency Transaction Report applies.",
        standard: "31 CFR 1010.311",
      },
      {
        code: "AMOUNT_REQUIRES_APPROVAL",
        severity: "escalate",
        message: "A wire above $50,000 requires secondary managerial approval.",
        standard: "SINA dual control: secondary approval",
      },
    ],
  },
  small: {
    verdict: "pass",
    mount: null,
    violations: [],
  },
  "list-transactions": {
    verdict: "pass",
    mount: "TransactionList",
    violations: [],
  },
  "fabricated-confirm": {
    verdict: "reject",
    mount: null,
    violations: [
      {
        code: "SCHEMA_INVALID",
        severity: "reject",
        message: "Unrecognized key: confirmButton. The schema is closed.",
      },
    ],
  },
};
