/**
 * CashflowSummary — a SINA presentational fintech component (ungoverned).
 * Renders the validated `cashflow_summary` payload: a period's inflow / outflow /
 * net as a SummaryList, with a Progress bar for the outflow-to-inflow ratio.
 * Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Progress, Stack, SummaryList } from "@sina-design-system/core";
import type { SummaryItem } from "@sina-design-system/core";

import { formatAmount } from "../format.js";

export interface CashflowSummaryProps {
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
  const ratio = inflow > 0 ? Math.min((outflow / inflow) * 100, 100) : 0;

  const items: SummaryItem[] = [
    { label: "Inflow", value: formatAmount(inflow, currency) },
    { label: "Outflow", value: formatAmount(outflow, currency) },
    { label: "Net", value: formatAmount(net, currency), emphasis: true },
  ];

  return (
    <Stack
      gap={3}
      aria-label={`Cashflow for ${period}`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <span className="text-ui font-medium text-text">{period}</span>

      {isEmpty ? (
        <p className="py-6 text-center text-ui text-text-muted">No cashflow this period.</p>
      ) : (
        <Stack gap={2}>
          <SummaryList items={items} />
          <Progress value={ratio} label={`Outflow is ${Math.round(ratio)}% of inflow`} />
        </Stack>
      )}
    </Stack>
  );
}
