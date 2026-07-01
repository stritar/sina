"use server";

/**
 * The interception seam, server-side (ROADMAP §1b). Entry points return a
 * serializable `ConsoleView` — the server decides, the client renders:
 *
 *   - `gateIntent(envelope)` — mock / direct: a canned or hand-authored `{ intent,
 *     props }` fed straight to the router. Deterministic, CI-safe.
 *   - `gateLive(prompt)`   — live: a real Claude model picks an intent via a tool
 *     call. `proposeWireTransfer` carries wire props (governed); `showData` carries
 *     ONLY a read intent verb (from the manifest) — the playground supplies that
 *     read's props from a fixture, so the model never fabricates financial data
 *     (SINA validates provenance, not truthfulness). The tool args are gated here,
 *     before anything renders.
 *
 * The authoritative check is `runGate` (→ the fintech router), never the tool's
 * zod mirror. (One canonical fixture per read; a real app would call a data tool.)
 */

import { generateText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

import {
  INTENTS,
  fintechIntentManifest,
  transactionFixtures,
  balanceFixtures,
  spendingFixtures,
  budgetFixtures,
  cardFixtures,
  rewardsFixtures,
  payeeFixtures,
  upcomingFixtures,
  portfolioFixtures,
  watchlistFixtures,
  type IntentEnvelope,
} from "@sina-design-system/fintech";
import { runGate, runExperience } from "./gate";
import type { ConsoleView, TransportError } from "./types";

export async function gateIntent(envelope: IntentEnvelope): Promise<ConsoleView> {
  return { kind: "gate", trace: runGate(envelope) };
}

/** Gate a composed multi-read experience (a dashboard); each intent is gated independently. */
export async function gateExperience(envelopes: IntentEnvelope[]): Promise<ConsoleView> {
  return { kind: "experience", traces: runExperience(envelopes) };
}

/** Canonical fixture per read intent — the model picks the verb, the playground supplies these props. */
const READ_FIXTURES: Record<string, unknown> = {
  [INTENTS.LIST_TRANSACTIONS]: transactionFixtures.validTwoTransactions,
  [INTENTS.ACCOUNT_BALANCE]: balanceFixtures.validBalance,
  [INTENTS.SPENDING_BREAKDOWN]: spendingFixtures.validBreakdown,
  [INTENTS.BUDGET_PROGRESS]: budgetFixtures.validBudgets,
  [INTENTS.LIST_CARDS]: cardFixtures.validCards,
  [INTENTS.REWARDS_SUMMARY]: rewardsFixtures.validRewards,
  [INTENTS.LIST_PAYEES]: payeeFixtures.validPayees,
  [INTENTS.UPCOMING_PAYMENTS]: upcomingFixtures.validUpcoming,
  [INTENTS.PORTFOLIO_HOLDINGS]: portfolioFixtures.validHoldings,
  [INTENTS.WATCHLIST]: watchlistFixtures.validWatchlist,
};

const DISPLAY_INTENTS = fintechIntentManifest().filter((entry) => entry.kind === "display");
const DISPLAY_VERBS = DISPLAY_INTENTS.map((entry) => entry.intent) as [string, ...string[]];
const DISPLAY_INTENTS_DESC = DISPLAY_INTENTS.map((entry) => `- ${entry.intent}: ${entry.summary}`).join("\n");

/** Loose structural mirror so the model knows the wire tool shape. NOT the gate. */
const proposeWireTransferParameters = z.object({
  amount: z.number().describe("amount in ISO-4217 minor units (e.g. cents)"),
  currency: z.string().describe("ISO 4217 code, e.g. USD"),
  debtor: z.object({ name: z.string(), address: z.string().optional(), account: z.any() }),
  creditor: z.object({ name: z.string(), address: z.string().optional(), account: z.any() }),
  reference: z.string().optional(),
});

export async function gateLive(prompt: string): Promise<ConsoleView> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      kind: "transport",
      error: {
        reason: "error",
        message: "Set ANTHROPIC_API_KEY in the environment to use live mode.",
      },
    };
  }

  try {
    const result = await generateText({
      model: anthropic("claude-opus-4-8"),
      system:
        "You are a banking agent. To SHOW the user their financial data, call `showData` with the intent that matches the request. To MOVE money, call `proposeWireTransfer` with the wire details (amounts in minor units/cents: $60,000 is 6000000; SEPA iban+bic accounts unless told otherwise). You pick the intent only — you never decide what renders, and you never fabricate the data for a read.",
      prompt,
      tools: {
        proposeWireTransfer: tool({
          description: "Propose a wire transfer for governance review. Emits intent + props only.",
          parameters: proposeWireTransferParameters,
        }),
        showData: tool({
          description: `Show the user their financial data (a read). Pick the intent that matches the request:\n${DISPLAY_INTENTS_DESC}`,
          parameters: z.object({ intent: z.enum(DISPLAY_VERBS) }),
        }),
      },
      toolChoice: "required",
      maxRetries: 1,
    });

    const dataCall = result.toolCalls.find((c) => c.toolName === "showData");
    if (dataCall) {
      const intent = (dataCall.args as { intent: string }).intent;
      return { kind: "gate", trace: runGate({ intent, props: READ_FIXTURES[intent] }) };
    }

    const wireCall = result.toolCalls.find((c) => c.toolName === "proposeWireTransfer");
    if (wireCall) {
      return {
        kind: "gate",
        trace: runGate({ intent: INTENTS.WIRE_TRANSFER, props: wireCall.args }),
      };
    }

    return {
      kind: "transport",
      error: { reason: "malformed", message: "The model did not choose an intent." },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const reason: TransportError["reason"] = /rate.?limit|429/i.test(message)
      ? "rate-limit"
      : /refus/i.test(message)
        ? "refusal"
        : "error";
    return { kind: "transport", error: { reason, message } };
  }
}
