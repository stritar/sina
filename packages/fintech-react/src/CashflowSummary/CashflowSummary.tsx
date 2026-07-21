/**
 * CashflowSummary — a SINA presentational fintech component (ungoverned).
 * Renders the validated `cashflow_summary` payload: a period's inflow / outflow /
 * net as a SummaryList (the numbers, as text) plus a `BarChart` comparing the
 * three (net dips below the baseline when the period runs negative). Read-only;
 * brand-open tokens.
 *
 * Client component: the interactive chart needs the browser and the
 * `valueFormatter` function cannot cross the RSC boundary. The gate stays
 * server-side — this only renders the decision it already made.
 */

"use client";

import type { IntentEnvelope } from "@sina-design-system/governance";
import { BarChart, Stack, SummaryList } from "@sina-design-system/core";
import type { SummaryItem } from "@sina-design-system/core";

import { formatAmount } from "../format.js";
import styles from "./CashflowSummary.module.css";

export interface CashflowSummaryProps {
  /** The server-validated `cashflow_summary` payload (`IntentProps<"cashflow_summary">` in `@sina-design-system/fintech`). */
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface CashflowView {
  period: string;
  currency: string;
  inflow: number;
  outflow: number;
  net: number;
}

/** Read a cashflow summary off a (server-validated) payload, tolerating a hostile shape. */
function readCashflow(payload: unknown): CashflowView {
  const d = (payload ?? {}) as Record<string, unknown>;
  const num = (value: unknown): number => (typeof value === "number" ? value : 0);
  const str = (value: unknown, fallback: string): string =>
    typeof value === "string" ? value : fallback;
  return {
    period: str(d.period, "—"),
    currency: str(d.currency, "USD"),
    inflow: num(d.inflow),
    outflow: num(d.outflow),
    net: num(d.net),
  };
}

export function CashflowSummary({ payload }: CashflowSummaryProps) {
  const { period, currency, inflow, outflow, net } = readCashflow(payload);
  const isEmpty = inflow === 0 && outflow === 0 && net === 0;

  const items: SummaryItem[] = [
    { label: "Inflow", value: formatAmount(inflow, currency) },
    { label: "Outflow", value: formatAmount(outflow, currency) },
    { label: "Net", value: formatAmount(net, currency), emphasis: true },
  ];

  return (
    <Stack
      gap={3}
      aria-label={`Cashflow for ${period}`}
      className={styles.card}
    >
      <span className={styles.period}>{period}</span>

      {isEmpty ? (
        <p className={styles.empty}>No cashflow this period.</p>
      ) : (
        <Stack gap={3}>
          <SummaryList items={items} />
          <div className={styles.chart}>
            <BarChart
              data={{
                labels: ["Inflow", "Outflow", "Net"],
                datasets: [{ label: period, data: [inflow, outflow, net] }],
              }}
              label={`Cashflow for ${period}: inflow, outflow, and net`}
              valueFormatter={(v) => formatAmount(v, currency)}
            />
          </div>
        </Stack>
      )}
    </Stack>
  );
}
