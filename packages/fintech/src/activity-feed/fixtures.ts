/** Activity-feed fixtures. Valid typed; adversarial `unknown`. */

import type { ActivityFeedPayload } from "./activity-feed.schema.js";

export const valid: ActivityFeedPayload = {
  items: [
    {
      id: "evt_001",
      at: "2026-07-03T09:12:00.000Z",
      kind: "login",
      title: "New sign-in from San Francisco",
      detail: "Chrome on macOS",
    },
    {
      id: "evt_002",
      at: "2026-07-02T18:45:30.000Z",
      kind: "payment",
      title: "Payment to Acme Utilities",
      detail: "Everyday Checking",
    },
    {
      id: "evt_003",
      at: "2026-07-01T14:03:00.000Z",
      kind: "transfer",
      title: "Transfer to Savings",
    },
    {
      id: "evt_004",
      at: "2026-06-30T07:30:00.000Z",
      kind: "alert",
      title: "Unusual activity flagged",
      detail: "A card purchase was held for review.",
    },
    {
      id: "evt_005",
      at: "2026-06-28T00:00:00.000Z",
      kind: "statement",
      title: "June statement is ready",
    },
  ],
};

export const validEmpty: ActivityFeedPayload = { items: [] };

/** An out-of-enum `kind` — a hostile stream cannot smuggle an unknown event type past the gate. */
export const adversarial: unknown = {
  items: [
    {
      id: "evt_x",
      at: "2026-07-03T09:12:00.000Z",
      kind: "wire_drain",
      title: "definitely fine",
    },
  ],
};
