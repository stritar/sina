/**
 * The search-results constitution — an UNGOVERNED display pattern.
 *
 * A query echo plus a bounded, shape-only list of matched entities (transaction,
 * payee, account, card, statement) — a pure read. Amounts are integer minor
 * units; every field bounded, `.strict()` per row. Mounts the presentational
 * `SearchResults`. No masked fields, so no redaction.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

const searchResult = z
  .object({
    id: z.string().min(1).max(40),
    kind: z.enum(["transaction", "payee", "account", "card", "statement"]),
    label: z.string().min(1).max(120),
    sublabel: z.string().min(1).max(120).optional(),
    amount: minorUnitAmount.optional(),
    currency: currencyCode.optional(),
  })
  .strict();

export const searchResultsPayload = z
  .object({
    query: z.string().max(120),
    results: z.array(searchResult).max(50, "too many results (max 50)"),
  })
  .strict();

export type SearchResultsPayload = z.infer<typeof searchResultsPayload>;

export const SEARCH_RESULTS_VERSION = "1.0.0";
