/**
 * Display helpers. Amounts are ISO-4217 minor units (the wire constitution's
 * model); convert to major units per currency for display. Presentation only —
 * these never feed the gate.
 */

import { MINOR_UNIT_EXPONENT, type CurrencyCode } from "@sina-design-system/fintech";

export function formatAmount(minor: number, currency: string): string {
  const exponent = MINOR_UNIT_EXPONENT[currency as CurrencyCode] ?? 2;
  const major = minor / 10 ** exponent;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
  } catch {
    return `${major.toLocaleString("en-US")} ${currency}`;
  }
}

interface WireParty {
  name?: string;
  scheme?: string;
}

export interface WireView {
  amount: number;
  currency: string;
  debtor: WireParty;
  creditor: WireParty;
}

function readParty(value: unknown): WireParty {
  if (!value || typeof value !== "object") return {};
  const party = value as Record<string, unknown>;
  const account =
    party.account && typeof party.account === "object"
      ? (party.account as Record<string, unknown>)
      : undefined;
  return {
    name: typeof party.name === "string" ? party.name : undefined,
    scheme: typeof account?.scheme === "string" ? account.scheme : undefined,
  };
}

/** Read the human-facing terms off an intent payload, tolerating a hostile shape. */
export function readWire(intent: unknown): WireView {
  const wire = (intent ?? {}) as Record<string, unknown>;
  return {
    amount: typeof wire.amount === "number" ? wire.amount : 0,
    currency: typeof wire.currency === "string" ? wire.currency : "USD",
    debtor: readParty(wire.debtor),
    creditor: readParty(wire.creditor),
  };
}
