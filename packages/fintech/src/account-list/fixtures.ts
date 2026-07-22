/** Account-list fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { AccountListPayload } from "./account-list.schema.js";

export const valid: AccountListPayload = {
  accounts: [
    {
      id: "acct_checking_01",
      name: "Everyday Checking",
      type: "checking",
      account: { label: "Everyday Checking", maskedNumber: "****4021" },
      balance: usd(4_820),
      currency: "USD",
    },
    {
      id: "acct_savings_01",
      name: "Emergency Fund",
      type: "savings",
      account: { label: "Emergency Fund", maskedNumber: "****7788" },
      balance: usd(18_500),
      currency: "USD",
    },
    {
      id: "acct_credit_01",
      name: "Rewards Card",
      type: "credit",
      account: { label: "Rewards Card", maskedNumber: "****0002" },
      // A credit balance is money owed → negative minor units (z.number().int()).
      balance: -usd(1_240),
      currency: "USD",
    },
  ],
};

export const validEmpty: AccountListPayload = { accounts: [] };

/** A full, unmasked account number → `maskedNumber` regex reject (a read must never carry one). */
export const adversarial: unknown = {
  accounts: [
    {
      id: "acct_checking_01",
      name: "Everyday Checking",
      type: "checking",
      account: { label: "Everyday Checking", maskedNumber: "4021401540214021" },
      balance: usd(4_820),
      currency: "USD",
    },
  ],
};
