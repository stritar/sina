/** Statement-list fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { StatementListPayload } from "./statement-list.schema.js";

export const valid: StatementListPayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  statements: [
    {
      id: "stmt_2026_06",
      periodStart: "2026-06-01T00:00:00.000Z",
      periodEnd: "2026-06-30T23:59:59.000Z",
      closingBalance: usd(4_820),
      currency: "USD",
      documentRef: "statement-2026-06.pdf",
    },
    {
      id: "stmt_2026_05",
      periodStart: "2026-05-01T00:00:00.000Z",
      periodEnd: "2026-05-31T23:59:59.000Z",
      closingBalance: usd(3_140),
      currency: "USD",
      documentRef: "statement-2026-05.pdf",
    },
    {
      id: "stmt_2026_04",
      periodStart: "2026-04-01T00:00:00.000Z",
      periodEnd: "2026-04-30T23:59:59.000Z",
      closingBalance: -usd(210),
      currency: "USD",
    },
  ],
};

export const validEmpty: StatementListPayload = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  statements: [],
};

/** 61 statements → `.max(60)` reject (a hostile stream cannot flood the client). */
export const adversarial: unknown = {
  account: { label: "Everyday Checking", maskedNumber: "****4021" },
  statements: Array.from({ length: 61 }, (_value, index) => ({
    id: `stmt_${index}`,
    periodStart: "2026-01-01T00:00:00.000Z",
    periodEnd: "2026-01-31T23:59:59.000Z",
    closingBalance: usd(1),
    currency: "USD",
  })),
};
