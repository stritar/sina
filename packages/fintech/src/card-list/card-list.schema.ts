/**
 * The card-list constitution — an UNGOVERNED display pattern.
 *
 * A wallet of cards for display: label, network, **masked** number (never a full
 * PAN), status, expiry. Shape-only, `.strict()` per card, bounded. Mounts the
 * presentational `CardList`. The masked number is additionally `mask`-redacted.
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { maskedNumber } from "../formats/masked-account.js";

const card = z
  .object({
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(80),
    network: z.enum(["visa", "mastercard", "amex", "discover"]),
    maskedNumber,
    status: z.enum(["active", "frozen", "cancelled"]),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "expiry must be MM/YY"),
  })
  .strict();

export const cardListPayload = z
  .object({
    cards: z.array(card).max(20, "too many cards (max 20)"),
  })
  .strict();

export type CardListPayload = z.infer<typeof cardListPayload>;

export const CARD_LIST_VERSION = "1.0.0";

export const CARD_LIST_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
