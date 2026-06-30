import { describe, expect, it } from "vitest";

import { isValidIban } from "./iban.js";
import { isValidBic } from "./bic.js";
import { isValidAbaRouting } from "./routing.js";
import { isValidLuhn } from "./card.js";
import { MINOR_UNIT_EXPONENT, toMinorUnits, usd } from "./currency.js";

describe("IBAN — ISO 13616 mod-97", () => {
  it("accepts a valid IBAN", () => {
    expect(isValidIban("DE89370400440532013000")).toBe(true);
  });
  it("accepts spaced / lowercased input", () => {
    expect(isValidIban("de89 3704 0044 0532 0130 00")).toBe(true);
  });
  it("rejects a bad check digit", () => {
    expect(isValidIban("DE00370400440532013000")).toBe(false);
  });
  it("rejects a malformed string", () => {
    expect(isValidIban("XX")).toBe(false);
  });
});

describe("BIC — ISO 9362", () => {
  it("accepts an 8-char BIC", () => expect(isValidBic("DEUTDEFF")).toBe(true));
  it("accepts an 11-char BIC", () => expect(isValidBic("DEUTDEFF500")).toBe(true));
  it("rejects a short BIC", () => expect(isValidBic("BAD")).toBe(false));
});

describe("ABA routing — 3-7-1 mod-10", () => {
  it("accepts the worked example 325081403", () => {
    expect(isValidAbaRouting("325081403")).toBe(true);
  });
  it("rejects a bad checksum", () => expect(isValidAbaRouting("325081404")).toBe(false));
  it("rejects a non-9-digit value", () => expect(isValidAbaRouting("12345")).toBe(false));
});

describe("Luhn — ISO/IEC 7812", () => {
  it("accepts a valid PAN", () => expect(isValidLuhn("4532015112830366")).toBe(true));
  it("rejects a bad checksum", () => expect(isValidLuhn("4532015112830367")).toBe(false));
  it("rejects a wrong-length value", () => expect(isValidLuhn("123")).toBe(false));
});

describe("minor units — ISO 4217 exponents", () => {
  it("usd() converts dollars to integer cents", () => expect(usd(50_000)).toBe(5_000_000));
  it("JPY is zero-decimal", () => expect(toMinorUnits(1_000, "JPY")).toBe(1_000));
  it("BHD is three-decimal", () => expect(toMinorUnits(50, "BHD")).toBe(50_000));
  it("exposes the exponent table", () => expect(MINOR_UNIT_EXPONENT.USD).toBe(2));
});
