/** Alerts-feed fixtures. Valid typed; adversarial `unknown`. */

import type { AlertsFeedPayload } from "./alerts-feed.schema.js";

export const valid: AlertsFeedPayload = {
  alerts: [
    {
      id: "alert_1",
      at: "2026-06-29T14:03:00.000Z",
      severity: "critical",
      title: "Unusual sign-in blocked",
      body: "A sign-in from an unrecognized device was blocked. Review your recent activity.",
    },
    {
      id: "alert_2",
      at: "2026-06-28T08:12:00.000Z",
      severity: "warning",
      title: "Card nearing its monthly limit",
      body: "Your everyday card has used 85% of its monthly spend limit.",
    },
    {
      id: "alert_3",
      at: "2026-06-27T19:45:00.000Z",
      severity: "info",
      title: "June statement ready",
    },
  ],
};

/** No alerts — a valid empty state (the component renders "No alerts."). */
export const validEmpty: AlertsFeedPayload = { alerts: [] };

/** An out-of-enum severity → `enum` reject (a hostile stream cannot invent a level). */
export const adversarial: unknown = {
  alerts: [
    {
      id: "alert_x",
      at: "2026-06-29T14:03:00.000Z",
      severity: "catastrophic",
      title: "Fabricated severity level",
    },
  ],
};
