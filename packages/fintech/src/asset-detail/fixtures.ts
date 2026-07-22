/** AssetDetail fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { AssetDetailPayload } from "./asset-detail.schema.js";

export const valid: AssetDetailPayload = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: usd(238),
  currency: "USD",
  changePct: 1.4,
  points: [
    23_100, 23_240, 23_050, 23_380, 23_510, 23_420, 23_690, 23_770, 23_640, 23_820,
    23_950, 23_880, 24_010, 23_930, 24_120, 24_240, 24_180, 23_990, 23_860, 23_800,
  ],
};

export const validEmpty: AssetDetailPayload = {
  symbol: "MSFT",
  name: "Microsoft Corp.",
  price: usd(410),
  currency: "USD",
  changePct: 0,
  points: [],
};

/** 367 points → `.max(366)` reject (a hostile stream cannot flood the client). */
export const adversarial: unknown = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: usd(238),
  currency: "USD",
  changePct: 1.4,
  points: Array.from({ length: 367 }, (_value, index) => 24_000 + index),
};
