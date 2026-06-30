/**
 * Wire-transfer fixtures — compliant and adversarial payloads the test suite
 * (and the Phase 4 playground) feed through {@link evaluateWireTransfer}.
 *
 * Valid fixtures are typed as `WireTransferPayload` so a drift in the schema
 * breaks them at compile time. Adversarial fixtures are intentionally malformed
 * and typed `unknown` — they model hostile LLM streams.
 */

import { usd } from "../formats/currency.js";
import type { WireTransferPayload } from "./wire-transfer.schema.js";

// Known-good identifiers (real test vectors): canonical DE example IBAN + BIC.
const VALID_IBAN = "DE89370400440532013000";
const VALID_BIC = "DEUTDEFF";

/** $500 SEPA transfer, fully formed, below every regulatory band → clean pass. */
export const validSmallTransfer: WireTransferPayload = {
  amount: usd(500),
  currency: "USD",
  debtor: { name: "Acme Corp", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
  creditor: { name: "Beta LLC", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
};

/** The roadmap's compliant $5,000 transfer — Travel Rule satisfied, SAR flag only. */
export const validFiveThousand: WireTransferPayload = {
  amount: usd(5_000),
  currency: "USD",
  debtor: {
    name: "Acme Corp",
    address: "1 Market St, San Francisco, CA",
    account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC },
  },
  creditor: {
    name: "Beta LLC",
    address: "9 King St, Austin, TX",
    account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC },
  },
};

/** €60,000 — format-valid, but non-USD: regulatory bands are NOT applied. */
export const validNonUsdLarge: WireTransferPayload = {
  amount: 6_000_000,
  currency: "EUR",
  debtor: { name: "Acme GmbH", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
  creditor: { name: "Beta SARL", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
};

/** $60,000 USD with full info — trips the $50k secondary-approval escalation. */
export const overLimitTransfer: unknown = {
  amount: usd(60_000),
  currency: "USD",
  debtor: {
    name: "Acme Corp",
    address: "1 Market St, San Francisco, CA",
    account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC },
  },
  creditor: {
    name: "Beta LLC",
    address: "9 King St, Austin, TX",
    account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC },
  },
};

/** $4,000 with the creditor address missing — Travel Rule info incomplete. */
export const travelRuleMissingInfo: unknown = {
  amount: usd(4_000),
  currency: "USD",
  debtor: {
    name: "Acme Corp",
    address: "1 Market St, San Francisco, CA",
    account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC },
  },
  creditor: { name: "Beta LLC", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
};

/** Invalid IBAN (mod-97 fails) → hard reject. */
export const malformedIban: unknown = {
  amount: usd(500),
  currency: "USD",
  debtor: { name: "Acme Corp", account: { scheme: "sepa", iban: "DE00370400440532013000", bic: VALID_BIC } },
  creditor: { name: "Beta LLC", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
};

/** Non-integer amount (minor units must be integer) → hard reject. */
export const nonIntegerAmount: unknown = {
  amount: 1000.5,
  currency: "USD",
  debtor: { name: "Acme Corp", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
  creditor: { name: "Beta LLC", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
};

/** A fabricated "Confirm" button smuggled in → `.strict()` reject. */
export const fabricatedConfirmButton: unknown = {
  ...(validSmallTransfer as object),
  confirmButton: true,
};

/** Prohibited card data (CVV) smuggled in → `.strict()` reject; redacted from audit. */
export const smuggledCardData: unknown = {
  ...(validSmallTransfer as object),
  cvv: "123",
};

/** Unsupported currency → enum reject. */
export const unsupportedCurrency: unknown = {
  ...(validSmallTransfer as object),
  currency: "XYZ",
};
