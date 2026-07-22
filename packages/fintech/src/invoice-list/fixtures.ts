/** Invoice-list fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { InvoiceListPayload } from "./invoice-list.schema.js";

export const valid: InvoiceListPayload = {
  currency: "USD",
  invoices: [
    {
      id: "inv_1001",
      number: "INV-1001",
      counterparty: "Acme Corp",
      amount: usd(4_800),
      dueAt: "2026-07-15T00:00:00.000Z",
      status: "sent",
    },
    {
      id: "inv_1002",
      number: "INV-1002",
      counterparty: "Globex LLC",
      amount: usd(12_500),
      dueAt: "2026-06-01T00:00:00.000Z",
      status: "overdue",
    },
    {
      id: "inv_1003",
      number: "INV-1003",
      counterparty: "Initech",
      amount: usd(2_150),
      dueAt: "2026-05-20T00:00:00.000Z",
      status: "paid",
    },
  ],
};

export const validEmpty: InvoiceListPayload = { currency: "USD", invoices: [] };

/** Out-of-enum `status` → the enum rejects it (a hostile stream cannot invent a state). */
export const adversarial: unknown = {
  currency: "USD",
  invoices: [
    {
      id: "inv_x",
      number: "INV-X",
      counterparty: "Umbrella Corp",
      amount: usd(999),
      dueAt: "2026-07-01T00:00:00.000Z",
      status: "cancelled",
    },
  ],
};
