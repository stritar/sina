/**
 * The FX quote constitution — an UNGOVERNED display pattern.
 *
 * A single currency-pair quote: base/quote codes, a positive exchange `rate`, an
 * `asOf` timestamp, and an optional dealer `spreadBps`. A pure read — shape-only,
 * no policy. Bounded scalars. Mounts the presentational `FxQuote`.
 */

import { z } from "zod";

import { currencyCode } from "../formats/currency.js";

export const fxQuotePayload = z
  .object({
    base: currencyCode,
    quote: currencyCode,
    rate: z.number().positive(),
    asOf: z.string().datetime(),
    spreadBps: z.number().int().nonnegative().optional(),
  })
  .strict();

export type FxQuotePayload = z.infer<typeof fxQuotePayload>;

export const FX_QUOTE_VERSION = "1.0.0";
