/** Payee-list fixtures. Valid typed; adversarial `unknown`. */

import type { PayeeListPayload } from "./payee-list.schema.js";

export const validPayees: PayeeListPayload = {
  payees: [
    { id: "p1", name: "Landlord LLC", maskedNumber: "****3321", verified: true, lastPaidAt: "2026-06-01T10:00:00.000Z" },
    { id: "p2", name: "City Utilities", maskedNumber: "****9080", verified: true },
    { id: "p3", name: "New Cleaner", maskedNumber: "****1122", verified: false },
  ],
};

export const validEmpty: PayeeListPayload = { payees: [] };

/** An unmasked account number → regex reject. */
export const unmaskedPayee: unknown = {
  payees: [{ id: "p1", name: "Landlord LLC", maskedNumber: "33213321", verified: true }],
};
