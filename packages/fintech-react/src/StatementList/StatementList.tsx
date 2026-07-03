/**
 * StatementList — a SINA presentational fintech component (ungoverned).
 * Renders the validated `list_statements` payload: a masked account header and a
 * list of statement periods, each with its closing balance (a negative balance
 * reads as a danger Badge, meaning carried by the sign not color alone) plus a
 * closing-balance sparkline. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Chart, Stack, SummaryList } from "@sina-design-system/core";
import type { SummaryItem } from "@sina-design-system/core";

import { formatAmount, formatDate } from "../format.js";

export interface StatementListProps {
  /** The server-validated `list_statements` payload. */
  payload: unknown;
  /**
   * Emit a new intent for any action this display later offers (e.g. download a
   * statement). The host feeds it back through the gate. Unused in the proving
   * slice — the display stays read-only until an action intent exists.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

interface MaskedAccountView {
  label: string;
  maskedNumber: string;
}

interface StatementRowView {
  id: string;
  periodStart: string;
  periodEnd: string;
  closingBalance: number;
  currency: string;
  documentRef?: string;
}

interface StatementListView {
  account: MaskedAccountView;
  statements: StatementRowView[];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Read a statement list off a (server-validated) payload, tolerating a hostile shape. */
function readStatementList(payload: unknown): StatementListView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const account = (data.account ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(data.statements) ? data.statements : [];
  return {
    account: { label: str(account.label, "—"), maskedNumber: str(account.maskedNumber) },
    statements: rows.map((row, index) => {
      const s = (row ?? {}) as Record<string, unknown>;
      return {
        id: str(s.id, `stmt_${index}`),
        periodStart: str(s.periodStart),
        periodEnd: str(s.periodEnd),
        closingBalance: num(s.closingBalance),
        currency: str(s.currency, "USD"),
        documentRef: typeof s.documentRef === "string" ? s.documentRef : undefined,
      };
    }),
  };
}

export function StatementList({ payload }: StatementListProps) {
  const { account, statements } = readStatementList(payload);

  // Oldest → newest, so the sparkline reads left-to-right chronologically.
  const trend = statements.map((s) => s.closingBalance).reverse();

  const items: SummaryItem[] = statements.map((s) => {
    const negative = s.closingBalance < 0;
    const amount = formatAmount(s.closingBalance, s.currency);
    return {
      label: `${formatDate(s.periodStart)} – ${formatDate(s.periodEnd)}`,
      value: negative ? (
        <Badge intent="danger" size="sm">
          {amount}
        </Badge>
      ) : (
        amount
      ),
    };
  });

  return (
    <Stack
      gap={3}
      aria-label={`Statements for ${account.label}`}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <span className="text-ui font-medium text-text">{account.label}</span>
        {account.maskedNumber ? (
          <span className="font-mono text-xs text-text-subtle">{account.maskedNumber}</span>
        ) : null}
      </Stack>

      {statements.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No statements to show.</p>
      ) : (
        <>
          {statements.length > 1 ? (
            <div className="h-12 w-full text-primary">
              <Chart
                data={trend}
                variant="area"
                label={`Closing balance trend for ${account.label}`}
              />
            </div>
          ) : null}
          <SummaryList items={items} />
        </>
      )}
    </Stack>
  );
}
