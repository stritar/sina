/**
 * BudgetProgress — a SINA presentational fintech component (ungoverned).
 * Renders the validated `budget_progress` payload as spent-vs-limit Progress
 * bars, flagging over-budget with a danger Badge. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Progress, Stack } from "@sina-design-system/core";

import { formatAmount, readBudgetProgress } from "../format.js";
import { useFintechLocale } from "../locale.js";
import styles from "./BudgetProgress.module.css";

export interface BudgetProgressProps {
  /** The server-validated `budget_progress` payload (`IntentProps<"budget_progress">` in `@sina-design-system/fintech`). */
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
  /** BCP-47 locale for money/date formatting. Overrides `FintechLocaleProvider`; defaults to `en-US`. */
  locale?: string;
}

export function BudgetProgress({ payload, locale: localeProp }: BudgetProgressProps) {
  const locale = useFintechLocale(localeProp);
  const { currency, budgets } = readBudgetProgress(payload);

  return (
    <Stack
      gap={3}
      aria-label="Budgets"
      className={styles.card}
    >
      {budgets.length === 0 ? (
        <p className={styles.empty}>No budgets to show.</p>
      ) : (
        <Stack gap={3}>
          {budgets.map((b, i) => {
            const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
            const over = b.spent > b.limit;
            return (
              <Stack key={i} gap={1}>
                <Stack direction="row" justify="between" align="center" gap={2}>
                  <span className={styles.budgetLabel}>{b.label}</span>
                  <span className={styles.budgetMeta}>
                    <span className={styles.budgetAmount}>
                      {formatAmount(b.spent, currency, locale)} / {formatAmount(b.limit, currency, locale)}
                    </span>
                    {over ? (
                      <Badge intent="danger" size="sm">
                        over
                      </Badge>
                    ) : null}
                  </span>
                </Stack>
                <Progress value={pct} label={`${b.label}: ${Math.round(pct)}% of budget`} />
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
