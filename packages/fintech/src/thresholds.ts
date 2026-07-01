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

/** Stripe-style sanity floor on a single charge (≈ $0.50). */
export const STRIPE_MIN_MINOR = usd(0.5); // docs.stripe.com/currencies

/** Stripe-style sanity ceiling on a single charge (8-digit max). */
export const STRIPE_MAX_MINOR = 99_999_999; // docs.stripe.com/api/payment_intents
