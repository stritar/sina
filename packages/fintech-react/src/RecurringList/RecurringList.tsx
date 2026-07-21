/**
 * RecurringList — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `list_recurring` payload the gate already passed:
 * recurring subscriptions with merchant, amount, cadence, a status Badge, and the
 * next charge date. It carries NO governance logic. Two rules it must keep:
 *
 *  1. **Read-only.** It offers no write action. Any action (e.g. "cancel this
 *     subscription") must emit a NEW intent through the gate via `onIntent` —
 *     never a raw button. `onIntent` is unused in the proving slice; it exists so
 *     a later action doesn't smuggle a money-moving control past the constitution.
 *  2. **Text, never HTML.** Free-text fields (merchant) render as text — never
 *     `dangerouslySetInnerHTML` — which neutralises markup a tool might return.
 *
 * Brand-open tokens only; the governed "secure" visual language is reserved for
 * escalations.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatAmount, formatDate } from "../format.js";
import { useFintechLocale } from "../locale.js";
import styles from "./RecurringList.module.css";

export interface RecurringListProps {
  /** The server-validated `list_recurring` payload (`IntentProps<"list_recurring">` in `@sina-design-system/fintech`). */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers (e.g. cancel a
   * subscription). The host feeds it back through the gate. Unused in the proving
   * slice — the display stays read-only until an action intent exists.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
  /** BCP-47 locale for money/date formatting. Overrides `FintechLocaleProvider`; defaults to `en-US`. */
  locale?: string;
}

type Cadence = "weekly" | "monthly" | "quarterly" | "yearly";
type Status = "active" | "paused" | "canceled";

interface SubscriptionView {
  id: string;
  merchant: string;
  amount: number;
  cadence: Cadence;
  nextChargeAt: string;
  status: Status;
}

interface RecurringListView {
  currency: string;
  subscriptions: SubscriptionView[];
}

const CADENCES: readonly Cadence[] = ["weekly", "monthly", "quarterly", "yearly"];
const STATUSES: readonly Status[] = ["active", "paused", "canceled"];

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read a recurring list off a (server-validated) payload, tolerating a hostile shape. */
function readRecurringList(payload: unknown): RecurringListView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.subscriptions) ? data.subscriptions : [];
  return {
    currency: str(data.currency, "USD"),
    subscriptions: list.map((row, index) => {
      const sub = (row ?? {}) as Record<string, unknown>;
      const cadence = str(sub.cadence);
      const status = str(sub.status);
      return {
        id: str(sub.id, `sub_${index}`),
        merchant: str(sub.merchant, "—"),
        amount: num(sub.amount),
        cadence: CADENCES.includes(cadence as Cadence) ? (cadence as Cadence) : "monthly",
        nextChargeAt: str(sub.nextChargeAt),
        status: STATUSES.includes(status as Status) ? (status as Status) : "active",
      };
    }),
  };
}

const STATUS_INTENT: Record<Status, "success" | "warning" | "neutral"> = {
  active: "success",
  paused: "warning",
  canceled: "neutral",
};

const STATUS_LABEL: Record<Status, string> = {
  active: "Active",
  paused: "Paused",
  canceled: "Canceled",
};

const CADENCE_LABEL: Record<Cadence, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function RecurringList({ payload, locale: localeProp }: RecurringListProps) {
  const locale = useFintechLocale(localeProp);
  const { currency, subscriptions } = readRecurringList(payload);

  return (
    <Stack
      gap={3}
      aria-label="Recurring subscriptions"
      className={styles.card}
    >
      {subscriptions.length === 0 ? (
        <p className={styles.empty}>No recurring subscriptions.</p>
      ) : (
        <Stack
          as="ul"
          gap={0}
          aria-label="Recurring subscriptions"
          className={styles.list}
        >
          {subscriptions.map((sub) => (
            <Stack
              as="li"
              key={sub.id}
              direction="row"
              justify="between"
              align="center"
              gap={3}
              className={styles.row}
            >
              <span className={styles.merchantCol}>
                <span className={styles.merchant}>{sub.merchant}</span>
                <span className={styles.cadence}>
                  {CADENCE_LABEL[sub.cadence]}
                  {sub.nextChargeAt ? ` · Next ${formatDate(sub.nextChargeAt, locale)}` : ""}
                </span>
              </span>
              <span className={styles.amountGroup}>
                <span className={styles.amount}>
                  {formatAmount(sub.amount, currency, locale)}
                </span>
                <Badge intent={STATUS_INTENT[sub.status]} size="sm">
                  {STATUS_LABEL[sub.status]}
                </Badge>
              </span>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
