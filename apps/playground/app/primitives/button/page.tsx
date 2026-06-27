import { Button } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function ButtonStory() {
  return (
    <StoryShell title="Button">
      <Demo label="Variants">
        <Button variant="primary">Confirm</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="ghost">Dismiss</Button>
      </Demo>
      <Demo label="Sizes · sm 24 / md 28 / lg 32 / xl 40 (comfortable)">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Comfortable</Button>
      </Demo>
      <Demo label="States">
        <Button loading>Submitting</Button>
        <Button disabled>Disabled</Button>
        <Button asChild>
          <a href="/primitives">As link</a>
        </Button>
      </Demo>
    </StoryShell>
  );
}
