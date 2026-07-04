/**
 * NetWorth — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `net_worth` payload: assets, liabilities, and a derived
 * net worth (emphasised), with an optional per-position breakdown and a
 * composition sparkline. Read-only (displays are read-only) — any future action
 * must emit a NEW intent through the gate via `onIntent`, never a raw control.
 * Free-text labels render as TEXT, never `dangerouslySetInnerHTML`. Brand-open
 * tokens; renders already-validated props, never gating anything.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Chart, Stack, SummaryList } from "@sina-design-system/core";

import { formatAmount } from "../format.js";
import styles from "./NetWorth.module.css";

export interface NetWorthProps {
  /** The server-validated `net_worth` payload. */
  payload: unknown;
  /** Emit a new intent for any action this display later offers (unused in the proving slice). */
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface NetWorthLineView {
  label: string;
  amount: number;
  kind: "asset" | "liability";
}

interface NetWorthView {
  currency: string;
  assets: number;
  liabilities: number;
  net: number;
  breakdown: NetWorthLineView[];
}

/** Read a net-worth payload off a (server-validated) shape, tolerating a hostile one. */
function readNetWorth(payload: unknown): NetWorthView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const lines = Array.isArray(data.breakdown) ? data.breakdown : [];
  return {
    currency: typeof data.currency === "string" ? data.currency : "USD",
    assets: typeof data.assets === "number" ? data.assets : 0,
    liabilities: typeof data.liabilities === "number" ? data.liabilities : 0,
    net: typeof data.net === "number" ? data.net : 0,
    breakdown: lines.map((line) => {
      const row = (line ?? {}) as Record<string, unknown>;
      return {
        label: typeof row.label === "string" ? row.label : "—",
        amount: typeof row.amount === "number" ? row.amount : 0,
        kind: row.kind === "liability" ? "liability" : "asset",
      };
    }),
  };
}

export function NetWorth({ payload }: NetWorthProps) {
  const { currency, assets, liabilities, net, breakdown } = readNetWorth(payload);

  return (
    <Stack
      gap={3}
      aria-label="Net worth"
      className={styles.root}
    >
      <SummaryList
        items={[
          { label: "Assets", value: formatAmount(assets, currency) },
          { label: "Liabilities", value: formatAmount(liabilities, currency) },
          { label: "Net worth", value: formatAmount(net, currency), emphasis: true },
        ]}
      />

      {breakdown.length === 0 ? (
        <p className={styles.empty}>No breakdown to show.</p>
      ) : (
        <>
          <div className={styles.chart}>
            <Chart
              variant="bar"
              data={breakdown.map((line) => line.amount)}
              label={`Net worth composition across ${breakdown.length} positions`}
            />
          </div>
          <Stack
            as="ul"
            gap={0}
            aria-label="Net worth breakdown"
            className={styles.list}
          >
            {breakdown.map((line, index) => (
              <Stack
                as="li"
                key={`${line.label}_${index}`}
                direction="row"
                justify="between"
                align="center"
                gap={3}
                className={styles.row}
              >
                <span className={styles.lineLabel}>
                  <Badge intent={line.kind === "asset" ? "success" : "neutral"} size="sm">
                    {line.kind === "asset" ? "Asset" : "Liability"}
                  </Badge>
                  <span className={styles.label}>{line.label}</span>
                </span>
                <span className={styles.amount}>
                  {formatAmount(line.amount, currency)}
                </span>
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
