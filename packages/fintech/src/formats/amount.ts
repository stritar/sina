/**
 * Monetary amount primitive — integer minor units.
 *
 * The model emits an integer in the currency's smallest unit (cents, fils),
 * mirroring Stripe's PaymentIntent `amount`. Integer-only sidesteps float error
 * and satisfies ISO 20022's fractional-digit cap by construction.
 *
 * @see https://docs.stripe.com/api/payment_intents (amount: positive integer, minor units)
 */

import { z } from "zod";

/** A non-negative integer number of minor units. Range bounds come from `thresholds`. */
export const minorUnitAmount = z
  .number({ invalid_type_error: "amount must be a number of minor units (integer cents)" })
  .int("amount must be an integer in minor units (Stripe PaymentIntent model)")
  .nonnegative("amount must be non-negative");
