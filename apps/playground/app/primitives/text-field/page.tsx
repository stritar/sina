import { TextField } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function TextFieldStory() {
  return (
    <StoryShell title="TextField">
      <Demo label="default">
        <TextField className="w-64" label="Recipient name" placeholder="Acme Payroll" />
      </Demo>
      <Demo label="filled + description">
        <TextField
          className="w-64"
          label="Recipient name"
          description="As it appears on the account."
          defaultValue="Acme Payroll"
        />
      </Demo>
      <Demo label="error">
        <TextField
          className="w-64"
          label="Recipient name"
          error="Recipient is required."
          placeholder="Acme Payroll"
        />
      </Demo>
      <Demo label="disabled">
        <TextField className="w-64" label="Recipient name" disabled defaultValue="Acme Payroll" />
      </Demo>
      <Demo label="multiline">
        <TextField className="w-80" label="Memo" multiline placeholder="Add a memo (optional)" />
      </Demo>
    </StoryShell>
  );
}
