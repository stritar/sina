/**
 * PayeeList — a SINA presentational fintech component (ungoverned).
 * Renders the validated `list_payees` payload: saved payees with a masked number
 * and a verified Badge. Read-only; brand-open tokens. Adding/verifying a payee is
 * a governed flow (a new intent), not a button here.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatDate, readPayeeList } from "../format.js";

export interface PayeeListProps {
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
}

export function PayeeList({ payload }: PayeeListProps) {
  const payees = readPayeeList(payload);

  return (
    <Stack
      gap={3}
      aria-label="Payees"
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      {payees.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">No payees to show.</p>
      ) : (
        <Stack as="ul" gap={0} className="divide-y divide-border-subtle">
          {payees.map((p) => (
            <Stack
              as="li"
              key={p.id}
              direction="row"
              justify="between"
              align="center"
              gap={3}
              className="py-2"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-ui font-medium text-text">{p.name}</span>
                <span className="font-mono text-xs text-text-subtle">{p.maskedNumber}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-0.5">
                <Badge intent={p.verified ? "success" : "neutral"} size="sm">
                  {p.verified ? "verified" : "unverified"}
                </Badge>
                {p.lastPaidAt ? (
                  <span className="text-xs text-text-subtle">last {formatDate(p.lastPaidAt)}</span>
                ) : null}
              </span>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
