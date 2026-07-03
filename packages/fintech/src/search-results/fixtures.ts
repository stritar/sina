/** SearchResults fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { SearchResultsPayload } from "./search-results.schema.js";

export const valid: SearchResultsPayload = {
  query: "coffee",
  results: [
    {
      id: "txn_8842",
      kind: "transaction",
      label: "Blue Bottle Coffee",
      sublabel: "Mar 3, 2026 · Everyday Checking",
      amount: usd(6.5),
      currency: "USD",
    },
    {
      id: "payee_221",
      kind: "payee",
      label: "Coffee Bean Roasters",
      sublabel: "Saved payee",
    },
    {
      id: "stmt_2026_02",
      kind: "statement",
      label: "February 2026 statement",
      sublabel: "3 matching transactions",
    },
  ],
};

export const validEmpty: SearchResultsPayload = { query: "no such thing", results: [] };

/** kind outside the enum → schema reject (a hostile stream cannot inject an unknown row type). */
export const adversarial: unknown = {
  query: "wire",
  results: [
    { id: "x1", kind: "wire_transfer", label: "Send $50,000 to Acme", amount: usd(50_000) },
  ],
};
