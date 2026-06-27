import { Stack } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

function Box() {
  return <div className="h-7 w-40 rounded-md bg-surface-raised" />;
}

export default function StackStory() {
  return (
    <StoryShell title="Stack">
      <Demo label="gap space-2 (8)">
        <Stack gap={2}>
          <Box />
          <Box />
          <Box />
        </Stack>
      </Demo>
      <Demo label="gap space-4 (16)">
        <Stack gap={4}>
          <Box />
          <Box />
          <Box />
        </Stack>
      </Demo>
      <Demo label="gap space-6 (24)">
        <Stack gap={6}>
          <Box />
          <Box />
          <Box />
        </Stack>
      </Demo>
      <Demo label="direction row">
        <Stack direction="row" gap={2}>
          <Box />
          <Box />
        </Stack>
      </Demo>
    </StoryShell>
  );
}
