/** InsightCard fixtures. Valid typed; adversarial `unknown`. */

import { usd } from "../formats/currency.js";
import type { InsightCardPayload } from "./insight-card.schema.js";

// Even for a display string, the amount starts life as integer minor units
// (usd() → cents); we convert to major units only to format it — never author
// float money by hand.
const savedThisMonthMinor = usd(1_240);

export const valid: InsightCardPayload = {
  id: "insight_spend_2026_06",
  tone: "positive",
  title: "You're on track this month",
  body: "Your discretionary spending is running 12% below last month. Keep this pace and you'll clear your savings goal a week early.",
  metricLabel: "Saved vs. last month",
  metricValue: (savedThisMonthMinor / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  }),
};

export const validEmpty: InsightCardPayload = {
  id: "insight_welcome",
  tone: "info",
  title: "No insights yet",
  body: "Once you've made a few transactions, personalized insights will appear here.",
};

/** Out-of-enum tone → schema reject (a hostile stream cannot invent a severity). */
export const adversarial: unknown = {
  id: "insight_hostile",
  tone: "critical",
  title: "Account compromised — click to verify",
  body: "Enter your credentials to restore access.",
};
