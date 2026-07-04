"use client";

/**
 * Composer — the chat input. Quick-stream chips + the full scenario Select, a
 * multiline prompt, and a send button. ⌘/Ctrl+Enter sends.
 */

import { Button, TextField } from "@sina-design-system/core";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { ScenarioPicker } from "./ScenarioPicker";
import styles from "./Composer.module.css";

export function Composer({
  value,
  onChange,
  onSend,
  onPickScenario,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPickScenario: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={styles.root}>
      <ScenarioPicker onPick={onPickScenario} disabled={disabled} />
      <TextField
        label="Agent prompt"
        multiline
        rows={3}
        value={value}
        placeholder="Ask the agent to wire funds…"
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            onSend();
          }
        }}
      />
      <div className={styles.footer}>
        <span className={styles.hint}>⌘/Ctrl+Enter to send</span>
        <Button
          onClick={onSend}
          disabled={disabled || value.trim().length === 0}
          iconRight={<PaperPlaneTilt className={styles.sendIcon} />}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
