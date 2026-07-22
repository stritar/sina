/**
 * The mandatory-disclosure constitution — a governed consent flow (Phase 6, §E).
 *
 * Regulatory text (Reg E, Truth-in-Lending, an FX-spread disclosure) the model
 * cannot alter or omit: SINA carries the verbatim `body` on the intent and the
 * constitution escalates to `MandatoryDisclosure` until the actor acknowledges it
 * (the shared `acknowledge` step-up mode). The `body` is a bounded array of
 * verbatim paragraphs; `.strict()` turns away any smuggled key.
 */

import { z } from "zod";
import { intercept, type InterceptionResult, type Violation } from "@sina-design-system/governance";

import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";

const disclosureBase = z
  .object({
    disclosureId: z.string().min(1).max(80),
    category: z.enum(["reg-e", "tila", "fx-spread", "privacy", "esign"]),
    version: z.string().min(1).max(40),
    title: z.string().min(1).max(160),
    /** Verbatim paragraphs SINA injects — bounded so a hostile stream can't flood the client. */
    body: z.array(z.string().min(1).max(2000)).min(1, "a disclosure needs text").max(30),
  })
  .strict();

/** The disclosure payload plus the optional shared step-up envelope. */
export const disclosurePayload = disclosureBase
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type DisclosurePayload = z.infer<typeof disclosurePayload>;

export const DISCLOSURE_VERSION = "1.0.0";

/** A disclosure must always be acknowledged before the action proceeds. */
export function makeDisclosurePolicy(ctx: ActionContext) {
  return function disclosurePolicy(data: DisclosurePayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "acknowledge",
      code: "DISCLOSURE_NOT_ACKNOWLEDGED",
      message: "the required disclosure must be acknowledged before proceeding",
      standard: "Reg E / TILA — mandatory disclosure",
    });
  };
}

/** Evaluate a disclosure intent (server-side gate + audit). */
export function evaluateDisclosure(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: disclosurePayload,
      policy: makeDisclosurePolicy(ctx),
      escalations: { DISCLOSURE_NOT_ACKNOWLEDGED: "MandatoryDisclosure" },
      version: DISCLOSURE_VERSION,
    },
    payload,
  );
}
