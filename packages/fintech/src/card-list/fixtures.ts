/** Card-list fixtures. Valid typed; adversarial `unknown`. */

import type { CardListPayload } from "./card-list.schema.js";

export const validCards: CardListPayload = {
  cards: [
    { id: "c1", label: "Everyday", network: "visa", maskedNumber: "****4021", status: "active", expiry: "08/28" },
    { id: "c2", label: "Travel", network: "mastercard", maskedNumber: "****7788", status: "frozen", expiry: "01/27" },
    { id: "c3", label: "Old card", network: "amex", maskedNumber: "****0002", status: "canceled", expiry: "05/25" },
  ],
};

export const validEmpty: CardListPayload = { cards: [] };

/**
 * A card with no network/expiry — an issuer whose data simply lacks them. Must
 * validate as-is: forcing an integrator to synthesize values to satisfy the
 * shape is the anti-pattern a provenance-first system exists to prevent.
 */
export const validSparseCard: CardListPayload = {
  cards: [{ id: "c4", label: "Debit", maskedNumber: "****3141", status: "active" }],
};

/** A full, unmasked PAN → regex reject (a read must never carry one). */
export const unmaskedPan: unknown = {
  cards: [
    {
      id: "c1",
      label: "Everyday",
      network: "visa",
      maskedNumber: "4021401540214021",
      status: "active",
      expiry: "08/28",
    },
  ],
};
