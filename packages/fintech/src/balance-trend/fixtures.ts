/** BalanceTrend fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { BalanceTrendPayload } from "./balance-trend.schema.js";

export const valid: BalanceTrendPayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4821" },
  currency: "USD",
  points: [
    { date: "2026-06-01T00:00:00.000Z", balance: usd(4_200) },
    { date: "2026-06-08T00:00:00.000Z", balance: usd(3_980) },
    { date: "2026-06-15T00:00:00.000Z", balance: usd(5_100) },
    { date: "2026-06-22T00:00:00.000Z", balance: usd(4_875) },
    { date: "2026-06-29T00:00:00.000Z", balance: usd(6_320) },
  ],
};

export const validEmpty: BalanceTrendPayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4821" },
  currency: "USD",
  points: [],
};

/** 367 points → `.max(366)` reject (a hostile stream cannot flood the client). */
export const adversarial: unknown = {
  account: { label: "Everyday Checking", maskedNumber: "****4821" },
  currency: "USD",
  points: Array.from({ length: 367 }, (_value, index) => ({
    date: "2026-06-01T00:00:00.000Z",
    balance: usd(index),
  })),
};
