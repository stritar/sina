import { Grid } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

function Cell() {
  return <div className="h-12 rounded-md bg-surface-raised" />;
}

export default function GridStory() {
  return (
    <StoryShell title="Grid">
      <Demo label="3-col · gap space-4">
        <Grid cols={3} gap={4} className="w-full">
          {Array.from({ length: 6 }, (_, i) => (
            <Cell key={i} />
          ))}
        </Grid>
      </Demo>
      <Demo label="2-col · gap space-2">
        <Grid cols={2} gap={2} className="w-full">
          {Array.from({ length: 4 }, (_, i) => (
            <Cell key={i} />
          ))}
        </Grid>
      </Demo>
    </StoryShell>
  );
}
