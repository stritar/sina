/** Clarify-choice fixtures. Valid typed; adversarial `unknown`. */

import type { ClarifyChoicePayload } from "./clarify-choice.schema.js";

/** The review's "which Alex?" — two server-resolved payees sharing a first name. */
export const validWhichAlex: ClarifyChoicePayload = {
  prompt: "Which Alex do you mean?",
  options: [
    { id: "payee_alex_berger", label: "Alex Berger", description: "Payee · ****2201" },
    { id: "payee_alex_chen", label: "Alex Chen", description: "Payee · ****8845" },
  ],
};

/** A three-way account choice with no descriptions — the minimal valid shape. */
export const validAccountChoice: ClarifyChoicePayload = {
  prompt: "Which account should I use?",
  options: [
    { id: "acct_checking", label: "Everyday Checking" },
    { id: "acct_savings", label: "Rainy-Day Savings" },
    { id: "acct_joint", label: "Joint Account" },
  ],
};

/** A single option is not a choice → `.min(2)` reject. */
export const singleOption: unknown = {
  prompt: "Which Alex do you mean?",
  options: [{ id: "payee_alex_berger", label: "Alex Berger" }],
};

/** A smuggled per-option action (execute-on-click) → nested `.strict()` reject. */
export const smuggledOptionAction: unknown = {
  prompt: "Which Alex do you mean?",
  options: [
    { id: "payee_alex_berger", label: "Alex Berger" },
    { id: "payee_alex_chen", label: "Alex Chen", executeTransfer: true },
  ],
};

/** 9 options → `.max(8)` reject (a flood of buttons is not a clarification). */
export const floodOfOptions: unknown = {
  prompt: "Pick one",
  options: Array.from({ length: 9 }, (_, i) => ({ id: `opt_${i}`, label: `Option ${i}` })),
};

/**
 * A label carrying markup — PASSES: SINA validates shape, not content safety.
 * The component must render it as text (never HTML); documented boundary.
 */
export const markupLabel: ClarifyChoicePayload = {
  prompt: "Which payee?",
  options: [
    { id: "p1", label: "<img src=x onerror=alert(1)>" },
    { id: "p2", label: "Beta LLC" },
  ],
};
