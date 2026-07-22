/**
 * SavingsGoal — a SINA presentational fintech component (ungoverned).
 * Renders the validated `savings_goal` payload: each goal's saved-vs-target
 * Progress with a percentage Badge and a saved / target / due SummaryList.
 * Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Progress, Stack, SummaryList } from "@sina-design-system/core";
import type { SummaryItem } from "@sina-design-system/core";

import { formatAmount, formatDate } from "../format.js";
import { useFintechLocale } from "../locale.js";
import styles from "./SavingsGoal.module.css";

export interface SavingsGoalProps {
  /** The server-validated `savings_goal` payload (`IntentProps<"savings_goal">` in `@sina-design-system/fintech`). */
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
  /** BCP-47 locale for money/date formatting. Overrides `FintechLocaleProvider`; defaults to `en-US`. */
  locale?: string;
}

interface GoalView {
  id: string;
  name: string;
  saved: number;
  target: number;
  dueAt?: string;
}

interface SavingsGoalView {
  currency: string;
  goals: GoalView[];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read savings goals off a (server-validated) payload, tolerating a hostile shape. */
function readSavingsGoal(payload: unknown): SavingsGoalView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(data.goals) ? data.goals : [];
  return {
    currency: str(data.currency, "USD"),
    goals: rows.map((row, index) => {
      const goal = (row ?? {}) as Record<string, unknown>;
      const dueAt = typeof goal.dueAt === "string" ? goal.dueAt : undefined;
      return {
        id: str(goal.id, `goal_${index}`),
        name: str(goal.name, "—"),
        saved: num(goal.saved),
        target: num(goal.target),
        dueAt,
      };
    }),
  };
}

export function SavingsGoal({ payload, locale: localeProp }: SavingsGoalProps) {
  const locale = useFintechLocale(localeProp);
  const { currency, goals } = readSavingsGoal(payload);

  return (
    <Stack
      gap={3}
      aria-label="Savings goals"
      className={styles.root}
    >
      {goals.length === 0 ? (
        <p className={styles.empty}>No savings goals yet.</p>
      ) : (
        <Stack as="ul" gap={4} aria-label="Savings goals" className={styles.list}>
          {goals.map((goal) => {
            const pct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
            const reached = goal.saved >= goal.target && goal.target > 0;
            const items: SummaryItem[] = [
              { label: "Saved", value: formatAmount(goal.saved, currency, locale), emphasis: true },
              { label: "Target", value: formatAmount(goal.target, currency, locale) },
            ];
            if (goal.dueAt) {
              items.push({ label: "Due", value: formatDate(goal.dueAt, locale) });
            }
            return (
              <Stack as="li" key={goal.id} gap={2}>
                <Stack direction="row" justify="between" align="center" gap={2}>
                  <span className={styles.goalName}>{goal.name}</span>
                  <Badge intent={reached ? "success" : "neutral"} size="sm">
                    {`${pct}%`}
                  </Badge>
                </Stack>
                <Progress value={pct} label={`${goal.name}: ${pct}% of target`} />
                <SummaryList items={items} />
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
