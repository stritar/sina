/**
 * The fintech pattern registry — the intent verbs SINA can render, each mapped to
 * its constitution rule and the component it mounts. Governed intents carry policy
 * + escalation (wire-transfer); ungoverned display intents carry a shape-only rule
 * and a presentational component. `evaluateFintechIntent` is the single
 * server-side entry the harness calls — it dispatches the envelope through the
 * router ({@link @sina-design-system/governance}).
 *
 * The registry is a FACTORY over the server-known {@link ApprovalContext} — never
 * a module constant — so a wire's initiator identity is bound per request (and can
 * never be frozen at import time, nor spoofed from the payload).
 */

import {
  dispatch,
  pattern,
  type Decision,
  type IntentEnvelope,
  type PatternRegistry,
} from "@sina-design-system/governance";

import {
  evaluateWireTransfer,
  AGENT_INITIATOR_ID,
  type ApprovalContext,
} from "./wire-transfer/wire-transfer.schema.js";
import {
  transactionListPayload,
  TRANSACTION_LIST_VERSION,
  TRANSACTION_LIST_REDACTION,
} from "./transaction-list/transaction-list.schema.js";
import {
  accountBalancePayload,
  ACCOUNT_BALANCE_VERSION,
  ACCOUNT_BALANCE_REDACTION,
} from "./account-balance/account-balance.schema.js";

/** The intent verbs the model may emit. Stable identifiers; the model never names a component. */
export const INTENTS = {
  WIRE_TRANSFER: "wire_transfer",
  LIST_TRANSACTIONS: "list_transactions",
  ACCOUNT_BALANCE: "account_balance",
} as const;

export type FintechIntent = (typeof INTENTS)[keyof typeof INTENTS];

/**
 * Build the fintech registry bound to a server-supplied {@link ApprovalContext}.
 * A factory, not a constant: the wire entry delegates to `evaluateWireTransfer`
 * so its initiator (four-eyes) context is applied per call and never frozen.
 */
export function fintechRegistry(
  ctx: ApprovalContext = { initiatorId: AGENT_INITIATOR_ID },
): PatternRegistry {
  return {
    // Governed money movement — policy escalates to the SecureWireDialog.
    [INTENTS.WIRE_TRANSFER]: { evaluate: (props) => evaluateWireTransfer(props, ctx) },

    // Ungoverned reads — shape-only, mount a presentational component on a clean pass.
    [INTENTS.LIST_TRANSACTIONS]: pattern({
      rule: {
        schema: transactionListPayload,
        redaction: TRANSACTION_LIST_REDACTION,
        version: TRANSACTION_LIST_VERSION,
        component: "TransactionList",
      },
    }),
    [INTENTS.ACCOUNT_BALANCE]: pattern({
      rule: {
        schema: accountBalancePayload,
        redaction: ACCOUNT_BALANCE_REDACTION,
        version: ACCOUNT_BALANCE_VERSION,
        component: "BalanceCard",
      },
    }),
  };
}

/**
 * The single server-side entry the harness calls. Dispatches an `{ intent, props }`
 * envelope through the router and returns the {@link Decision} (result + mount).
 */
export function evaluateFintechIntent(envelope: IntentEnvelope, ctx?: ApprovalContext): Decision {
  return dispatch(fintechRegistry(ctx), envelope);
}

/** A model-facing descriptor of one renderable intent (advisory; the gate stays authoritative). */
export interface IntentDescriptor {
  intent: string;
  kind: "display" | "governed";
  component: string;
  summary: string;
}

/**
 * The intent manifest — which intents exist and what they render. This is what
 * tells a model which verbs it may emit. Per-intent prop JSON-schema attaches when
 * the repo moves to Zod 4's `z.toJSONSchema` (or adds `zod-to-json-schema`); until
 * then `gateLive` mirrors each prop schema in its tool definition. Advisory UX —
 * `evaluateFintechIntent` (the server gate) remains authoritative.
 */
export function fintechIntentManifest(): IntentDescriptor[] {
  return [
    {
      intent: INTENTS.LIST_TRANSACTIONS,
      kind: "display",
      component: "TransactionList",
      summary: "Show a bounded list of an account's posted transactions.",
    },
    {
      intent: INTENTS.ACCOUNT_BALANCE,
      kind: "display",
      component: "BalanceCard",
      summary: "Show an account's available and current balance.",
    },
    {
      intent: INTENTS.WIRE_TRANSFER,
      kind: "governed",
      component: "SecureWireDialog",
      summary: "Initiate a wire transfer (governed: limits, Travel Rule, secondary approval).",
    },
  ];
}
