/**
 * The USD-scope sweep guard — the "€60,000 wire, zero violations" regression net.
 *
 * Every money-movement policy defines its amount bands in USD and must NEVER
 * silently pass a non-USD payload: the pass stays valid (`flag` does not block)
 * but must carry exactly one POLICY_BANDS_NOT_EVALUATED violation with its
 * citation. This table dispatches a format-valid EUR payload through every
 * currency-carrying evaluator, so a future schema that reintroduces the bare
 * `if (currency !== "USD") return violations;` short-circuit fails here even if
 * its own suite forgets to check.
 */

import { describe, expect, it } from "vitest";

import { evaluateWireTransfer } from "./wire-transfer/wire-transfer.schema.js";
import { evaluateAchTransfer } from "./ach-transfer/ach-transfer.schema.js";
import { evaluateBillPay } from "./bill-pay/bill-pay.schema.js";
import { evaluateP2pPayment } from "./p2p-payment/p2p-payment.schema.js";
import { evaluateCryptoWithdraw } from "./crypto-withdraw/crypto-withdraw.schema.js";
import { evaluateRecurringSetup } from "./recurring-setup/recurring-setup.schema.js";
import { evaluateChangeLimit } from "./change-limit/change-limit.schema.js";
import { evaluateFxConvert } from "./fx-convert/fx-convert.schema.js";
import { evaluateWithdraw } from "./withdraw/withdraw.schema.js";
import { POLICY_BANDS_NOT_EVALUATED, USD_SCOPE_STANDARD } from "./formats/usd-scope.js";
import type { InterceptionResult } from "@sina-design-system/governance";

// Real test vectors: canonical DE IBAN/BIC, a checksum-valid ABA routing number.
const VALID_IBAN = "DE89370400440532013000";
const VALID_BIC = "DEUTDEFF";
const VALID_ROUTING = "021000021";

/** €6,000.00 — over several USD bands if they applied, format-valid everywhere. */
const AMOUNT = 600_000;

const CASES: Array<{ name: string; run: () => InterceptionResult }> = [
  {
    name: "wire_transfer",
    run: () =>
      evaluateWireTransfer({
        amount: AMOUNT,
        currency: "EUR",
        debtor: { name: "Acme GmbH", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
        creditor: { name: "Beta SARL", account: { scheme: "sepa", iban: VALID_IBAN, bic: VALID_BIC } },
      }),
  },
  {
    name: "ach_transfer",
    run: () =>
      evaluateAchTransfer({
        amount: AMOUNT,
        currency: "EUR",
        counterparty: { name: "Beta SARL", routingNumber: VALID_ROUTING, accountNumber: "12345678" },
      }),
  },
  {
    name: "bill_pay",
    run: () =>
      evaluateBillPay({
        amount: AMOUNT,
        currency: "EUR",
        payee: { id: "payee_1", name: "Stadtwerke", maskedNumber: "****1234" },
      }),
  },
  {
    name: "p2p_payment",
    run: () =>
      evaluateP2pPayment({
        amount: AMOUNT,
        currency: "EUR",
        recipient: { handle: "@alex.berger" },
      }),
  },
  {
    name: "crypto_withdraw",
    run: () =>
      evaluateCryptoWithdraw({
        amount: AMOUNT,
        currency: "EUR",
        asset: "BTC",
        quantity: 0.1,
        destination: "bc1qexampledestination00",
        network: "bitcoin",
      }),
  },
  {
    name: "recurring_setup",
    run: () =>
      evaluateRecurringSetup({
        amount: AMOUNT,
        currency: "EUR",
        cadence: "monthly",
        payee: { name: "Vermieter" },
        startAt: "2027-01-01T09:00:00Z",
      }),
  },
  {
    name: "change_limit",
    run: () =>
      evaluateChangeLimit({
        amount: AMOUNT,
        currency: "EUR",
        limitType: "daily_card",
      }),
  },
  {
    name: "fx_convert",
    run: () =>
      evaluateFxConvert({
        amount: AMOUNT,
        currency: "EUR",
        toCurrency: "USD",
        rate: 1.08,
      }),
  },
  {
    name: "withdraw",
    run: () =>
      evaluateWithdraw({
        amount: AMOUNT,
        currency: "EUR",
        method: "branch",
        account: { label: "Girokonto", maskedNumber: "****9876" },
      }),
  },
];

describe("USD-scope sweep — no money-movement policy passes non-USD silently", () => {
  it.each(CASES)("$name flags the non-USD pass", ({ run }) => {
    const result = run();
    expect(result.valid).toBe(true);
    expect(result.requiredComponent).toBeNull();
    const flags = result.violations.filter((v) => v.code === POLICY_BANDS_NOT_EVALUATED);
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({ severity: "flag", standard: USD_SCOPE_STANDARD });
    expect(flags[0]!.message).toContain("EUR");
    // The flag is the ONLY violation: no USD band may have fired on a non-USD payload.
    expect(result.violations).toHaveLength(1);
  });
});
