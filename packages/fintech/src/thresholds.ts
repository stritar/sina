/**
 * The constitution's numeric limits — the single, cited source of truth.
 *
 * Every threshold traces to a regulator or a documented API; the citation lives
 * on the line. Values are **USD integer minor units** (cents) via {@link usd};
 * the regulatory bands are USD-denominated (FX conversion is out of scope).
 */

import { usd } from "./formats/currency.js";

/** FinCEN Travel Rule — funds transfers at/above this must carry originator + beneficiary info. */
export const TRAVEL_RULE_MINOR = usd(3_000); // 31 CFR 1010.410(e) / 1020.320

/** FinCEN SAR — suspicious activity at/above this is reportable (classification flag). */
export const SAR_MINOR = usd(5_000); // 31 CFR Chapter X

/** FinCEN CTR — currency transactions *exceeding* this are reportable (classification flag). */
export const CTR_MINOR = usd(10_000); // 31 CFR 1010.311

/** SINA policy — wires *above* this require secondary managerial approval. */
export const WIRE_SECONDARY_APPROVAL_MINOR = usd(50_000); // SINA dual-control policy

/** Nacha Same Day ACH — per-payment dollar limit; a same-day entry above this is rejected. */
export const ACH_SAMEDAY_MAX_MINOR = usd(1_000_000); // Nacha Operating Rules (Same Day ACH)

/** SINA policy — ACH transfers *above* this require authorization (step-up). */
export const ACH_AUTHORIZATION_MINOR = usd(25_000); // SINA dual-control policy

/** SINA policy — P2P / instant transfers *above* this require authorization. */
export const P2P_AUTHORIZATION_MINOR = usd(2_500); // SINA dual-control policy

/** SINA policy — bill payments *above* this require authorization. */
export const BILLPAY_AUTHORIZATION_MINOR = usd(10_000); // SINA dual-control policy

/** SINA policy — cash withdrawals *above* this require authorization (CTR-adjacent). */
export const WITHDRAWAL_AUTHORIZATION_MINOR = usd(10_000); // 31 CFR 1010.311-adjacent + SINA policy

/** SINA policy — a per-cycle standing-order cap *above* this requires authorization. */
export const RECURRING_CYCLE_CAP_MINOR = usd(5_000); // SINA dual-control policy

/** SINA policy — FX conversions *above* this require authorization + spread disclosure. */
export const FX_AUTHORIZATION_MINOR = usd(10_000); // SINA dual-control policy

/** FATF Travel Rule (crypto) — VASP transfers at/above this must carry originator + beneficiary info. */
export const CRYPTO_TRAVEL_RULE_MINOR = usd(1_000); // FATF R.16 / 31 CFR 1010.410 (crypto)

/** SINA policy — a spending-limit change *above* this delta requires dual-control. */
export const LIMIT_CHANGE_AUTHORIZATION_MINOR = usd(10_000); // SINA dual-control policy

/** SINA policy — a B2B pending payment *above* this requires maker-checker approval. */
export const B2B_APPROVAL_MINOR = usd(10_000); // SINA maker-checker policy

/** SINA policy — a consumer loan/credit request *above* this requires disclosures + review. */
export const CREDIT_REQUEST_MINOR = usd(5_000); // Reg Z / SINA policy

/** Stripe-style sanity floor on a single charge (≈ $0.50). */
export const STRIPE_MIN_MINOR = usd(0.5); // docs.stripe.com/currencies

/** Stripe-style sanity ceiling on a single charge (8-digit max). */
export const STRIPE_MAX_MINOR = 99_999_999; // docs.stripe.com/api/payment_intents
