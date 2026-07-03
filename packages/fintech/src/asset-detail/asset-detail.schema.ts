/**
 * The asset-detail constitution — an UNGOVERNED display pattern.
 *
 * One instrument in depth: price, day change, and a bounded price series — a pure
 * read. Shape-only; `price` is integer minor units; `changePct` is a plain number;
 * `points` are integers. Bounded. Mounts the presentational `AssetDetail`.
 */

import { z } from "zod";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";

export const assetDetailPayload = z
  .object({
    symbol: z.string().min(1).max(12),
    name: z.string().min(1).max(80),
    price: minorUnitAmount,
    currency: currencyCode,
    changePct: z.number(),
    points: z.array(z.number().int()).max(366, "too many points (max 366)"),
  })
  .strict();

export type AssetDetailPayload = z.infer<typeof assetDetailPayload>;

export const ASSET_DETAIL_VERSION = "1.0.0";
