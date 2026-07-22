/** Recurring-list fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { RecurringListPayload } from "./recurring-list.schema.js";

export const valid: RecurringListPayload = {
  currency: "USD",
  subscriptions: [
    {
      id: "sub_netflix",
      merchant: "Netflix",
      amount: usd(15.49),
      cadence: "monthly",
      nextChargeAt: "2026-07-14T00:00:00.000Z",
      status: "active",
    },
    {
      id: "sub_spotify",
      merchant: "Spotify",
      amount: usd(10.99),
      cadence: "monthly",
      nextChargeAt: "2026-07-20T00:00:00.000Z",
      status: "paused",
    },
    {
      id: "sub_nyt",
      merchant: "New York Times",
      amount: usd(4),
      cadence: "weekly",
      nextChargeAt: "2026-07-08T00:00:00.000Z",
      status: "active",
    },
    {
      id: "sub_aws",
      merchant: "AWS",
      amount: usd(240),
      cadence: "yearly",
      nextChargeAt: "2027-01-01T00:00:00.000Z",
      status: "canceled",
    },
  ],
};

export const validEmpty: RecurringListPayload = {
  currency: "USD",
  subscriptions: [],
};

/** Out-of-enum cadence ("biweekly" is not a supported cadence) → schema reject. */
export const adversarial: unknown = {
  currency: "USD",
  subscriptions: [
    {
      id: "sub_evil",
      merchant: "Anywhere",
      amount: usd(9.99),
      cadence: "biweekly",
      nextChargeAt: "2026-07-14T00:00:00.000Z",
      status: "active",
    },
  ],
};
