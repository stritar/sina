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
import { useFintechLocale } from "../locale.js";
import styles from "./BalanceCard.module.css";

export interface BalanceCardProps {
  /** The server-validated `account_balance` payload (`IntentProps<"account_balance">` in `@sina-design-system/fintech`). */
  payload: unknown;
  /** Emit a new intent for any action this display later offers (unused in the proving slice). */
  onIntent?: (envelope: IntentEnvelope) => void;
  /** BCP-47 locale for money/date formatting. Overrides `FintechLocaleProvider`; defaults to `en-US`. */
  locale?: string;
}

export function BalanceCard({ payload, locale: localeProp }: BalanceCardProps) {
  const locale = useFintechLocale(localeProp);
  const { account, available, current, currency } = readBalance(payload);

  return (
    <Stack
      gap={3}
      aria-label={`Balance for ${account.label}`}
      className={styles.card}
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className={styles.accountLabel}>{account.label}</span>
        {account.maskedNumber ? (
          <span className={styles.accountNumber}>{account.maskedNumber}</span>
        ) : null}
      </Stack>
      <SummaryList
        items={[
          {
            label: "Available",
            value: formatAmount(available, currency, locale),
            emphasis: true,
          },
          { label: "Current", value: formatAmount(current, currency, locale) },
        ]}
      />
    </Stack>
  );
}
