/**
 * The clarify-choice constitution — an UNGOVERNED display pattern.
 *
 * A disambiguation surface: "Transfer €250 to Alex" when the payee book holds an
 * Alex Berger and an Alex Chen. The model asks the host to clarify; the HOST
 * (server) resolves the candidate list from its own store and the model only
 * ever sends selection hints — a model-authored option list would validate and
 * still defeat the purpose (the display-provenance rule). Shape-only: no policy,
 * no escalations. Mounts the presentational `ClarifyChoice`; a selection is a
 * HINT the host feeds back to its model/server — the follow-up intent (a
 * payment, a read) still goes through the gate on its own.
 *
 * `.strict()` (top-level and per-option) turns away a fabricated action inside
 * an option; the option list is bounded so a hostile stream cannot flood the
 * client with a wall of buttons.
 */

import { z } from "zod";

/** One server-resolved candidate. `.strict()` rejects a smuggled per-option action. */
const choiceOption = z
  .object({
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(80),
    /** A disambiguating detail (e.g. a masked account tail, a city) — text, never markup. */
    description: z.string().min(1).max(140).optional(),
  })
  .strict();

export const clarifyChoicePayload = z
  .object({
    /** The question the user is being asked, e.g. "Which Alex do you mean?". */
    prompt: z.string().min(1).max(200),
    /** A disambiguation needs a real choice; more than 8 options is a picker, not a clarification. */
    options: z.array(choiceOption).min(2, "a clarification needs at least 2 options").max(8, "too many options (max 8)"),
  })
  .strict();

export type ChoiceOption = z.infer<typeof choiceOption>;
export type ClarifyChoicePayload = z.infer<typeof clarifyChoicePayload>;

export const CLARIFY_CHOICE_VERSION = "1.0.0";
