/**
 * The fintech constitution's standards catalog — every real-world standard the
 * schemas encode, and what the code *actually* checks for each.
 *
 * Pure data: no `zod`, no schema imports, so the docs can render this without
 * pulling the constitution into a bundle (exported on the `./standards` subpath).
 *
 * The `enforcement` field is the honest one, and the reason this file exists. SINA
 * validates an IBAN's mod-97 checksum for real; it does **not** perform a PCI
 * assessment, screen against OFAC, or run a full CIP — it rejects prohibited card
 * fields by name and steps up identity. Say the mechanism, never the compliance
 * claim. A bidirectional guard (`standards.test.ts`) fails the build if a rule
 * cites a standard missing here, or if an entry here cites nothing the code does.
 */

import type { Standard } from "@sina-design-system/governance";

export const FINTECH_STANDARDS: Standard[] = [
  // ── Format: structure + checksums. Real arithmetic, no judgment calls. ──────
  {
    id: "iso-4217",
    name: "ISO 4217",
    authority: "ISO",
    title: "Currency codes & minor units",
    tier: "format",
    enforcement:
      "Currency must be one of 8 supported codes (USD, EUR, GBP, CAD, AUD, CHF, JPY, BHD), not the full ISO table. Amounts are integer minor units with the correct per-currency exponent (JPY 0, BHD 3, rest 2), never floats.",
    citations: ["ISO 4217"],
    where: ["formats/currency", "every money schema"],
    url: "https://www.iso.org/iso-4217-currency-codes.html",
  },
  {
    id: "iso-13616",
    name: "ISO 13616 / ISO 7064",
    authority: "ISO",
    title: "IBAN structure & checksum",
    tier: "format",
    enforcement:
      "Full mod-97 (ISO 7064) checksum, computed rather than pattern-matched. Structure is 2-letter ISO 3166-1 country + 2 check digits + BBAN, capped at 34 chars.",
    citations: ["ISO 13616", "ISO 7064"],
    where: ["formats/iban", "wire_transfer (SEPA leg)"],
    url: "https://www.iban.com/structure",
  },
  {
    id: "iso-9362",
    name: "ISO 9362",
    authority: "ISO",
    title: "BIC / SWIFT code",
    tier: "format",
    enforcement:
      "Structural validation only: 8 or 11 characters, well-formed bank/country/location. No SWIFT directory lookup, and no SWIFT MT messaging.",
    citations: ["ISO 9362"],
    where: ["formats/bic", "wire_transfer (SEPA leg)"],
  },
  {
    id: "iso-7812",
    name: "ISO/IEC 7812",
    authority: "ISO/IEC",
    title: "Card number (Luhn)",
    tier: "format",
    enforcement: "Luhn check digit, computed over a 13 to 19 digit PAN.",
    citations: ["ISO/IEC 7812"],
    where: ["formats/card"],
  },
  {
    id: "aba-routing",
    name: "ABA routing number",
    authority: "American Bankers Association",
    title: "Routing transit number",
    tier: "format",
    enforcement: "9 digits with the 3-7-1 weighted mod-10 check digit, computed.",
    citations: ["ABA routing transit number"],
    where: ["formats/routing", "ach_transfer", "wire_transfer (domestic leg)"],
  },
  {
    id: "iso-20022",
    name: "ISO 20022",
    authority: "ISO",
    title: "Payment message constraints",
    tier: "format",
    enforcement:
      "Two constraints only: the remittance `reference` is capped at 140 chars, and the minor-units amount model satisfies the fractional-digit cap by construction. SINA does not implement ISO 20022 messages (no pain.001 / pacs.008).",
    citations: ["ISO 20022"],
    where: ["formats/amount", "wire_transfer"],
  },
  {
    id: "pci-dss-3-3-1",
    name: "PCI-DSS v4.0 Req 3.3.1",
    authority: "PCI SSC",
    title: "Sensitive authentication data must not be stored",
    tier: "format",
    enforcement:
      "A field-name deny-list (cvv, cvv2, cvc2, cav2, cid, pin, pinblock, track, track1, track2): the strict schema rejects the payload and the audit redaction drops the fields, so they can never reach a log. This is a storage guard, not a PCI assessment.",
    citations: ["PCI-DSS v4.0 Req 3.3.1"],
    where: ["formats/card", "every governed schema's redaction"],
  },

  // ── Regulatory: real rules. Not yours to loosen. ───────────────────────────
  {
    id: "fincen-travel-rule",
    name: "31 CFR 1010.410(e) / 1020.320",
    authority: "FinCEN",
    title: "Travel Rule",
    tier: "regulatory",
    enforcement:
      "A wire at or above $3,000 must carry originator and beneficiary name + address; missing information escalates to a governed dialog. Amount band, USD only.",
    citations: ["31 CFR 1010.410(e) / 1020.320"],
    where: ["wire_transfer"],
  },
  {
    id: "fincen-sar",
    name: "31 CFR Chapter X",
    authority: "FinCEN",
    title: "Suspicious Activity Report",
    tier: "regulatory",
    enforcement:
      "A wire at or above $5,000 is flagged for SAR review. A `flag` records the finding in the audit trail; it does not block the action.",
    citations: ["31 CFR Chapter X"],
    where: ["wire_transfer"],
  },
  {
    id: "fincen-ctr",
    name: "31 CFR 1010.311",
    authority: "FinCEN",
    title: "Currency Transaction Report",
    tier: "regulatory",
    enforcement:
      "An amount above $10,000 is flagged as CTR-reportable. A `flag` records it in the audit trail; it does not block. USD only.",
    citations: ["31 CFR 1010.311"],
    where: ["wire_transfer", "ach_transfer", "bill_pay", "withdraw"],
  },
  {
    id: "fatf-r16",
    name: "FATF R.16",
    authority: "FATF",
    title: "Crypto Travel Rule",
    tier: "regulatory",
    enforcement:
      "A crypto withdrawal above $1,000 without authorization escalates to a governed dialog. Amount band only: SINA does not screen the destination address against an allowlist or a sanctions list.",
    citations: ["FATF R.16"],
    where: ["crypto_withdraw"],
  },
  {
    id: "nacha-same-day-ach",
    name: "Nacha Operating Rules",
    authority: "Nacha",
    title: "Same Day ACH per-payment limit",
    tier: "regulatory",
    enforcement:
      "A same-day ACH entry above $1,000,000 is a hard reject: the payment cannot proceed and no component mounts. USD only.",
    citations: ["Nacha Operating Rules"],
    where: ["ach_transfer"],
  },
  {
    id: "fincen-cip",
    name: "31 CFR 1020.220",
    authority: "FinCEN",
    title: "Customer Identification Program",
    tier: "regulatory",
    enforcement:
      "KYC verification escalates to an identity step-up (second factor). A simplified stand-in: a production CIP would layer document checks, sanctions/PEP screening and ongoing due diligence onto this envelope. SINA implements none of those.",
    citations: ["31 CFR 1020.220"],
    where: ["kyc"],
  },
  {
    id: "reg-e",
    name: "Reg E (12 CFR 1005)",
    authority: "CFPB",
    title: "Electronic fund transfers & error resolution",
    tier: "regulatory",
    enforcement:
      "A dispute requires a step-up before it is filed, and a mandatory disclosure must be acknowledged before the flow proceeds. SINA does not implement the regulation's error-resolution timelines.",
    citations: ["Reg E (12 CFR 1005.11)", "Reg E / TILA"],
    where: ["dispute", "disclosure"],
  },
  {
    id: "reg-z-tila",
    name: "Reg Z / TILA (12 CFR 1026)",
    authority: "CFPB",
    title: "Credit disclosures",
    tier: "regulatory",
    enforcement:
      "A credit request cannot proceed until the disclosure is acknowledged, and a request above $5,000 is flagged for review. SINA gates the acknowledgement; it does not author or verify the disclosure's content.",
    citations: ["Reg Z / TILA (12 CFR 1026)"],
    where: ["credit_request"],
  },
  {
    id: "finra-2111",
    name: "FINRA Rule 2111",
    authority: "FINRA",
    title: "Suitability",
    tier: "regulatory",
    enforcement:
      "A trade requires an explicit order confirmation (second factor) before it is placed. SINA does not run a suitability determination, market-hours check, or position cap.",
    citations: ["FINRA Rule 2111"],
    where: ["place_trade"],
  },
  {
    id: "finra-2264",
    name: "FINRA Rule 2264 / Reg T",
    authority: "FINRA / Federal Reserve",
    title: "Margin disclosure",
    tier: "regulatory",
    enforcement:
      "Enabling margin forces the margin disclosure to be acknowledged before it can proceed. SINA gates the acknowledgement; it does not compute margin requirements.",
    citations: ["FINRA Rule 2264"],
    where: ["enable_margin"],
  },

  // ── SINA policy: tunable product defaults. NOT law. ────────────────────────
  {
    id: "sina-dual-control",
    name: "SINA dual-control",
    authority: "SINA (product default)",
    title: "Four-eyes approval, payload binding, separation of duties",
    tier: "policy",
    enforcement:
      "Above a per-rail limit an action escalates and needs a second approver. The approval is bound to a hash of the exact terms, recomputed server-side (so an approved $5,000 cannot execute as $60,000), and the approver must differ from the server-known initiator (no self-approval). Both binding failures are hard rejects. Tune the limits to your own risk appetite.",
    citations: ["SINA dual-control"],
    where: [
      "wire_transfer ($50k)",
      "ach_transfer ($25k)",
      "bill_pay ($10k)",
      "withdraw ($10k)",
      "fx_convert ($10k)",
      "recurring_setup ($5k/cycle)",
      "change_limit ($10k)",
      "close_account",
    ],
  },
  {
    id: "sina-step-up",
    name: "SINA step-up policy",
    authority: "SINA (product default)",
    title: "Second-factor step-up on sensitive actions",
    tier: "policy",
    enforcement:
      "A second factor is required before a sensitive, non-monetary action completes: adding a payee or authorized user, linking an account, issuing a card, cancelling/replacing a card, changing security settings, and P2P above $2,500. Tunable.",
    citations: ["SINA policy"],
    where: [
      "add_payee",
      "add_user",
      "link_account",
      "issue_card",
      "card_control",
      "security_change",
      "p2p_payment",
    ],
  },
];
