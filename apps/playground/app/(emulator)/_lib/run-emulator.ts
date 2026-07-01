"use server";

/**
 * The interception seam, server-side (ROADMAP §1b). Two entry points, both
 * returning a serializable `ConsoleView` — the server decides, the client renders
 * the decision:
 *
 *   - `gateIntent(payload)` — mock / direct: a canned or hand-authored intent fed
 *     straight to the constitution. Deterministic, CI-safe.
 *   - `gateLive(prompt)`   — live: a real Claude model proposes the wire via a
 *     tool call (intent + props, never a component); the tool ARGS are gated
 *     here, before anything renders.
 *
 * The authoritative check is `runGate` (→ `evaluateWireTransfer`), never the
 * tool's zod mirror.
 */

import { generateText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

import { runGate } from "./gate";
import type { ConsoleView, TransportError } from "./types";

export async function gateIntent(payload: unknown): Promise<ConsoleView> {
  return { kind: "gate", trace: runGate(payload) };
}

/** Loose structural mirror so the model knows the tool shape. NOT the gate. */
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
        "You are a banking agent. To act on a wire request, call the proposeWireTransfer tool with the wire details. Amounts are in minor units (cents): $60,000 is 6000000. Use SEPA (iban+bic) accounts unless told otherwise. Propose intent only — you never decide what renders.",
      prompt,
      tools: {
        proposeWireTransfer: tool({
          description:
            "Propose a wire transfer for governance review. Emits intent + props only.",
          parameters: proposeWireTransferParameters,
        }),
      },
      toolChoice: "required",
      maxRetries: 1,
    });

    const call = result.toolCalls.find((c) => c.toolName === "proposeWireTransfer");
    if (!call) {
      return {
        kind: "transport",
        error: { reason: "malformed", message: "The model did not propose a wire transfer." },
      };
    }

    return { kind: "gate", trace: runGate(call.args) };
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
