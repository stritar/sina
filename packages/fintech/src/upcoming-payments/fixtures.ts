/** Upcoming-payments fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { UpcomingPaymentsPayload } from "./upcoming-payments.schema.js";

export const validUpcoming: UpcomingPaymentsPayload = {
  currency: "USD",
  payments: [
    { id: "u1", payee: "Landlord LLC", amount: usd(1_800), dueAt: "2026-07-01T00:00:00.000Z", status: "scheduled" },
    { id: "u2", payee: "City Utilities", amount: usd(140), dueAt: "2026-07-05T00:00:00.000Z", status: "pending" },
    { id: "u3", payee: "Credit Card", amount: usd(560), dueAt: "2026-06-28T00:00:00.000Z", status: "overdue" },
  ],
};

export const validEmpty: UpcomingPaymentsPayload = { currency: "USD", payments: [] };

/** An out-of-enum status → reject. */
export const badStatus: unknown = {
  currency: "USD",
  payments: [{ id: "u1", payee: "X", amount: usd(10), dueAt: "2026-07-01T00:00:00.000Z", status: "whenever" }],
};
