import { Alert } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function AlertStory() {
  return (
    <StoryShell title="Alert">
      <Demo label="Intents (icon + text + role — never color alone)">
        <div className="flex w-full flex-col gap-3">
          <Alert variant="info" title="Heads up">
            Informational context for the current step.
          </Alert>
          <Alert variant="success" title="Compliant">
            The stream passed validation.
          </Alert>
          <Alert variant="warning" title="Requires review">
            This action needs a second look before it proceeds.
          </Alert>
          <Alert variant="danger" title="Blocked">
            SINA stopped this stream. role=&quot;alert&quot; announces it assertively.
          </Alert>
        </div>
      </Demo>
    </StoryShell>
  );
}
