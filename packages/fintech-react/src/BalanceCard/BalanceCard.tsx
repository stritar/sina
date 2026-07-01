/**
 * BalanceCard — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `account_balance` payload as an available/current
 * summary, composing the `core` SummaryList. Read-only (see the
 * displays-are-read-only rule); brand-open tokens; renders already-validated
 * props, never gating anything.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Stack, SummaryList } from "@sina-design-system/core";

import { formatAmount, readBalance } from "../format.js";

export interface BalanceCardProps {
  /** The server-validated `account_balance` payload. */
  payload: unknown;
  /** Emit a new intent for any action this display later offers (unused in the proving slice). */
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function BalanceCard({ payload }: BalanceCardProps) {
  const { account, available, current, currency } = readBalance(payload);

  return (
    <Stack
      gap={3}
      aria-label={`Balance for ${account.label}`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className="text-ui font-medium text-text">{account.label}</span>
        {account.maskedNumber ? (
          <span className="font-mono text-xs text-text-subtle">{account.maskedNumber}</span>
        ) : null}
      </Stack>
      <SummaryList
        items={[
          { label: "Available", value: formatAmount(available, currency), emphasis: true },
          { label: "Current", value: formatAmount(current, currency) },
        ]}
      />
    </Stack>
  );
}
