/**
 * OrderHistory — a SINA presentational fintech component (ungoverned).
 * Renders the validated `order_history` payload: a trade-order ledger, each row a
 * symbol + side Badge + quantity + fill price + status Badge. Read-only; free-text
 * fields render as TEXT, never HTML. Placing/canceling an order is a governed flow
 * (a new intent), not a button here. Brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack, type BadgeProps } from "@sina-design-system/core";

import { formatAmount, formatDate } from "../format.js";
import styles from "./OrderHistory.module.css";

export interface OrderHistoryProps {
  /** The server-validated `order_history` payload (`IntentProps<"order_history">` in `@sina-design-system/fintech`). */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers (e.g. cancel an
   * open order). The host feeds it back through the gate. Unused in the proving
   * slice — the display stays read-only until an action intent exists.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface OrderRowView {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  currency: string;
  filledAt: string;
  status: string;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read an order ledger off a (server-validated) payload, tolerating a hostile shape. */
function readOrderHistory(payload: unknown): OrderRowView[] {
  const data = (payload ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.orders) ? data.orders : [];
  return list.map((row, index) => {
    const order = (row ?? {}) as Record<string, unknown>;
    return {
      id: str(order.id, `order_${index}`),
      symbol: str(order.symbol, "—"),
      side: order.side === "sell" ? "sell" : "buy",
      quantity: num(order.quantity),
      price: num(order.price),
      currency: str(order.currency, "USD"),
      filledAt: str(order.filledAt),
      status: str(order.status, "open"),
    };
  });
}

/** Status → Badge intent (color is decorative; the status text carries the meaning). */
const STATUS_INTENT: Record<string, NonNullable<BadgeProps["intent"]>> = {
  filled: "success",
  partial: "warning",
  open: "info",
  canceled: "neutral",
};

export function OrderHistory({ payload }: OrderHistoryProps) {
  const orders = readOrderHistory(payload);

  return (
    <Stack
      gap={3}
      aria-label="Order history"
      className={styles.root}
    >
      {orders.length === 0 ? (
        <p className={styles.empty}>No orders to show.</p>
      ) : (
        <Stack as="ul" gap={0} aria-label="Orders" className={styles.list}>
          {orders.map((o) => {
            const statusIntent = STATUS_INTENT[o.status] ?? "neutral";
            return (
              <Stack
                as="li"
                key={o.id}
                direction="row"
                justify="between"
                align="center"
                gap={3}
                className={styles.row}
              >
                <span className={styles.symbolCol}>
                  <span className={styles.symbolRow}>
                    <span className={styles.symbol}>{o.symbol}</span>
                    <Badge intent={o.side === "buy" ? "info" : "neutral"} size="sm">
                      {o.side}
                    </Badge>
                  </span>
                  <span className={styles.meta}>
                    {o.quantity} · {formatDate(o.filledAt)}
                  </span>
                </span>
                <span className={styles.priceCol}>
                  <span className={styles.price}>
                    {formatAmount(o.price, o.currency)}
                  </span>
                  <Badge intent={statusIntent} size="sm">
                    {o.status}
                  </Badge>
                </span>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
