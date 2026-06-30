/**
 * @sina-design-system/fintech
 *
 * The Fintech "constitution": pure Zod schemas that intercept and validate LLM
 * intents server-side before they are allowed to render. No React, no UI. Every
 * rule traces to a standard or regulator (citations live on the rule); the
 * shared interception contract + audit come from `@sina-design-system/governance`.
 */

// Format primitives (ISO 4217 / 13616 / 9362, ABA, Luhn) + the minor-units model.
export * from "./formats/currency.js";
export * from "./formats/amount.js";
export * from "./formats/iban.js";
export * from "./formats/bic.js";
export * from "./formats/routing.js";
export * from "./formats/card.js";

// The cited numeric limits (the legible constitution).
export * from "./thresholds.js";

// The flagship governed schema.
export * from "./wire-transfer/wire-transfer.schema.js";

// Canned compliant/adversarial payloads (consumed by the Phase 4 playground).
export * as wireFixtures from "./wire-transfer/fixtures.js";
