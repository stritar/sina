/**
 * GovernedWireSummary — the pass-state reply: the governed, accessible primitive
 * SINA mounted once the gate cleared. A surface-secure card summarizing the wire.
 */

import { Alert, SummaryList } from "@sina-design-system/core";
import { formatAmount } from "../_lib/format";

interface WireParty {
  name?: string;
  account?: { scheme?: string };
}

function readParty(value: unknown): WireParty {
  if (value && typeof value === "object") {
    const party = value as Record<string, unknown>;
    return {
      name: typeof party.name === "string" ? party.name : undefined,
      account:
        party.account && typeof party.account === "object"
          ? { scheme: (party.account as Record<string, unknown>).scheme as string }
          : undefined,
    };
  }
  return {};
}

export function GovernedWireSummary({ payload }: { payload: unknown }) {
  const wire = (payload ?? {}) as Record<string, unknown>;
  const amount = typeof wire.amount === "number" ? wire.amount : 0;
  const currency = typeof wire.currency === "string" ? wire.currency : "USD";
  const debtor = readParty(wire.debtor);
  const creditor = readParty(wire.creditor);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-secure p-3">
      <Alert variant="success" title="Governed & mounted">
        The payload cleared the constitution — SINA mounted the accessible primitive.
      </Alert>
      <SummaryList
        items={[
          { label: "Amount", value: formatAmount(amount, currency), emphasis: true },
          { label: "Currency", value: currency },
          { label: "From", value: debtor.name ?? "—" },
          { label: "To", value: creditor.name ?? "—" },
          { label: "Rail", value: (debtor.account?.scheme ?? "—").toUpperCase() },
        ]}
      />
    </div>
  );
}
