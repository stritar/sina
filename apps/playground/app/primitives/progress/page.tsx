import { Progress } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function ProgressStory() {
  return (
    <StoryShell title="Progress">
      <Demo label="determinate 60%">
        <Progress value={60} label="Upload" className="w-80" />
      </Demo>
      <Demo label="indeterminate">
        <Progress label="Validating" className="w-80" />
      </Demo>
    </StoryShell>
  );
}
