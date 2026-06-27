import { Spinner } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function SpinnerStory() {
  return (
    <StoryShell title="Spinner">
      <Demo label="sm / md / lg">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </Demo>
    </StoryShell>
  );
}
