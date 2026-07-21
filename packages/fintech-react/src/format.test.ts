import { describe, expect, it } from "vitest";

import { formatAmount, formatDate, formatPct, readWire } from "./format.js";

describe("formatAmount — locale", () => {
  it("uses the en-US default when no locale is given", () => {
    // 6_000_000 USD minor units = $60,000.00
    expect(formatAmount(6_000_000, "USD")).toBe("$60,000.00");
  });

  it("honors a supplied locale (the reported en-US-vs-host mismatch)", () => {
    const us = formatAmount(6_000_000, "EUR", "en-US");
    const de = formatAmount(6_000_000, "EUR", "de-DE");
    expect(de).not.toBe(us); // locale actually changes the output
    expect(de).toContain("60.000,00"); // de-DE grouping/decimal
  });
});

describe("formatDate — locale", () => {
  it("renders the en-US default (the reported 'Jul 20, 2026')", () => {
    expect(formatDate("2026-07-20T00:00:00Z")).toBe("Jul 20, 2026");
  });

  it("renders the host locale when supplied (PennyPinchr's en-IE '20 Jul 2026')", () => {
    expect(formatDate("2026-07-20T00:00:00Z", "en-IE")).toBe("20 Jul 2026");
  });
});

describe("formatPct — default output is unchanged", () => {
  it("keeps the signed en-US percent", () => {
    expect(formatPct(1.8)).toBe("+1.8%");
    expect(formatPct(-0.6)).toBe("−0.6%");
  });
});

describe("readWire — required money terms fail loud, not silent", () => {
  it("reads clean terms with nothing missing", () => {
    const w = readWire({
      amount: 6_000_000,
      currency: "EUR",
      debtor: {},
      creditor: {},
    });
    expect(w.missing).toEqual([]);
    expect(w.amount).toBe(6_000_000);
    expect(w.currency).toBe("EUR");
  });

  it("reports a missing amount and currency instead of defaulting to $0.00 / USD", () => {
    const w = readWire({ debtor: { name: "Acme" } });
    expect(w.missing).toEqual(["amount", "currency"]);
  });

  it("reports only the term that is actually missing", () => {
    expect(readWire({ amount: 100 }).missing).toEqual(["currency"]);
    expect(readWire({ currency: "EUR" }).missing).toEqual(["amount"]);
    expect(readWire({ amount: 100, currency: "" }).missing).toEqual([
      "currency",
    ]);
  });
});
