/**
 * AccountList — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `list_accounts` payload: a customer's accounts, each with
 * a type Badge, a masked number, and a formatted balance, plus a same-currency
 * total. Read-only (see the displays-are-read-only rule); brand-open tokens;
 * renders already-validated props, never gating anything.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack, SummaryList } from "@sina-design-system/core";

import { formatAmount } from "../format.js";

export interface AccountListProps {
  /** The server-validated `list_accounts` payload. */
  payload: unknown;
  /** Emit a new intent for any action this display later offers (unused in the proving slice). */
  onIntent?: (envelope: IntentEnvelope) => void;
}

type BadgeIntent = "info" | "success" | "warning" | "danger" | "neutral";

/** Human label + a status tint per account type. Fallback stays neutral. */
const TYPE_META: Record<string, { label: string; intent: BadgeIntent }> = {
  checking: { label: "Checking", intent: "info" },
  savings: { label: "Savings", intent: "success" },
  credit: { label: "Credit", intent: "warning" },
  loan: { label: "Loan", intent: "danger" },
  investment: { label: "Investment", intent: "neutral" },
};

interface AccountRowView {
  id: string;
  name: string;
  type: string;
  maskedNumber: string;
  balance: number;
  currency: string;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read the account list off a (server-validated) payload, tolerating a hostile shape. */
function readAccountList(payload: unknown): AccountRowView[] {
  const data = (payload ?? {}) as Record<string, unknown>;
  const accounts = Array.isArray(data.accounts) ? data.accounts : [];
  return accounts.map((entry, index) => {
    const row = (entry ?? {}) as Record<string, unknown>;
    const ref = (row.account ?? {}) as Record<string, unknown>;
    return {
      id: str(row.id, `account_${index}`),
      name: str(row.name, "—"),
      type: str(row.type, "checking"),
      maskedNumber: str(ref.maskedNumber),
      balance: num(row.balance),
      currency: str(row.currency, "USD"),
    };
  });
}

export function AccountList({ payload }: AccountListProps) {
  const accounts = readAccountList(payload);

  // Only sum a total when every account shares one currency (mixed-currency
  // totals are meaningless, so we omit the row rather than render a wrong figure).
  const first = accounts[0];
  const uniformCurrency =
    first && accounts.every((a) => a.currency === first.currency) ? first.currency : null;
  const total = uniformCurrency ? accounts.reduce((sum, a) => sum + a.balance, 0) : null;

  return (
    <Stack
      gap={3}
      aria-label="Accounts"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      {accounts.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">You have no accounts.</p>
      ) : (
        <>
          <Stack
            as="ul"
            gap={0}
            aria-label="Account list"
            className="divide-y divide-border-subtle"
          >
            {accounts.map((account) => {
              const meta = TYPE_META[account.type] ?? { label: account.type, intent: "neutral" as const };
              return (
                <Stack
                  as="li"
                  key={account.id}
                  direction="row"
                  justify="between"
                  align="center"
                  gap={3}
                  className="py-2"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-ui font-medium text-text">{account.name}</span>
                      <Badge intent={meta.intent} size="sm">
                        {meta.label}
                      </Badge>
                    </span>
                    {account.maskedNumber ? (
                      <span className="truncate font-mono text-xs text-text-subtle">
                        {account.maskedNumber}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-ui font-semibold text-text">
                    {formatAmount(account.balance, account.currency)}
                  </span>
                </Stack>
              );
            })}
          </Stack>
          {total !== null && uniformCurrency ? (
            <SummaryList
              items={[{ label: "Total", value: formatAmount(total, uniformCurrency), emphasis: true }]}
            />
          ) : null}
        </>
      )}
    </Stack>
  );
}
