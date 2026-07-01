"use client";

/**
 * Composer — the chat input. Quick-stream chips + the full scenario Select, a
 * multiline prompt, and a send button. ⌘/Ctrl+Enter sends.
 */

import { Button, TextField } from "@sina-design-system/core";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { ScenarioPicker } from "./ScenarioPicker";

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
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-raised p-3 shadow-sm">
      <ScenarioPicker onPick={onPickScenario} disabled={disabled} />
      <TextField
        label="Agent prompt"
        multiline
        rows={3}
        value={value}
        placeholder="Ask the agent to wire funds… (⌘/Ctrl+Enter to send)"
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            onSend();
          }
        }}
      />
      <div className="flex justify-end">
        <Button
          onClick={onSend}
          disabled={disabled || value.trim().length === 0}
          iconRight={<PaperPlaneTilt className="size-control-xs" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
