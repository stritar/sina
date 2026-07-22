/**
 * ClarifyChoice — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `clarify_choice` payload: a disambiguation question with
 * server-resolved options ("Which Alex do you mean?"). Two rules it must keep:
 *
 *  1. **A selection is a hint, not an action.** Picking an option emits the
 *     option through `onSelect` so the host can feed it back to its model or
 *     server; the follow-up intent (the payment, the read) still goes through
 *     the gate on its own. This component never executes anything.
 *  2. **Text, never HTML.** Prompt, labels, and descriptions render as text —
 *     never `dangerouslySetInnerHTML` — which neutralises markup a tool might
 *     have returned.
 *
 * Brand-open tokens only (ordinary UI that rebrands cleanly).
 */

import { Button, Stack } from "@sina-design-system/core";

import { readClarifyChoice, type ChoiceOptionView } from "../format.js";
import styles from "./ClarifyChoice.module.css";

export interface ClarifyChoiceProps {
  /** The server-validated `clarify_choice` payload (`IntentProps<"clarify_choice">` in `@sina-design-system/fintech`). */
  payload: unknown;
  /**
   * The user picked an option. A selection HINT for the host to resolve into
   * the next gated intent — never an execution. Optional: without it the
   * options render as a read-only list.
   */
  onSelect?: (option: ChoiceOptionView) => void;
}

export function ClarifyChoice({ payload, onSelect }: ClarifyChoiceProps) {
  const { prompt, options } = readClarifyChoice(payload);

  if (options.length === 0) {
    return (
      <div aria-label="Clarification" className={styles.card}>
        <p className={styles.empty}>Nothing to clarify.</p>
      </div>
    );
  }

  return (
    <Stack gap={3} role="group" aria-label={prompt || "Clarification"} className={styles.card}>
      <p className={styles.prompt}>{prompt}</p>
      <Stack as="ul" gap={2} className={styles.list}>
        {options.map((option) => (
          <li key={option.id} className={styles.item}>
            <Button
              variant="secondary"
              size="sm"
              className={styles.option}
              onClick={onSelect ? () => onSelect(option) : undefined}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              {option.description ? (
                <span className={styles.optionDescription}>{option.description}</span>
              ) : null}
            </Button>
          </li>
        ))}
      </Stack>
    </Stack>
  );
}
