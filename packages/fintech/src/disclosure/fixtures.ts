/** Disclosure fixtures. Valid typed; adversarial `unknown`. */

import type { DisclosurePayload } from "./disclosure.schema.js";

const regE = {
  disclosureId: "reg-e-eft",
  category: "reg-e" as const,
  version: "2024.1",
  title: "Electronic Fund Transfer Disclosure",
  body: [
    "Tell us AT ONCE if you believe your card or PIN has been lost or stolen.",
    "You may be liable for unauthorized transfers if you do not notify us in time.",
  ],
};

/** Acknowledged → passes. */
export const validAcknowledged: DisclosurePayload = {
  ...regE,
  stepUp: { acknowledged: true },
};

/** Not yet acknowledged → escalate to MandatoryDisclosure. */
export const notAcknowledged: unknown = { ...regE };

/** A fabricated key → `.strict()` reject. */
export const fabricatedKey: unknown = { ...regE, autoAccept: true };
