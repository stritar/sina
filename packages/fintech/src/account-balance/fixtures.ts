/**
 * Account-balance fixtures — a valid balance read plus hostile shapes. Valid is
 * typed; adversarial is `unknown`. Fed through `evaluateFintechIntent` with intent
 * `account_balance`.
 */

import { usd } from "../formats/currency.js";
import type { AccountBalancePayload } from "./account-balance.schema.js";

/** A checking-account balance → clean ungoverned pass. */
export const validBalance: AccountBalancePayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  available: usd(4_820),
  current: usd(5_000),
  currency: "USD",
};

/** Available balance as a float → hard reject (integer minor units only). */
export const nonIntegerBalance: unknown = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  available: 4820.5,
  current: 500_000,
  currency: "USD",
};

/** A full, unmasked account number → regex reject (a read must never carry one). */
export const unmaskedAccount: unknown = {
  account: { label: "Everyday Checking", maskedNumber: "4021401540214021" },
  available: usd(4_820),
  current: usd(5_000),
  currency: "USD",
};
