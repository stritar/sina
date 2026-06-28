import { ScrollArea } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function ScrollAreaStory() {
  return (
    <StoryShell title="ScrollArea">
      <Demo label="Vertical">
        <ScrollArea className="h-44 w-80 rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="flex h-7 items-center rounded-md bg-surface-raised px-3 font-mono text-xs text-text-muted"
              >
                Row {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Demo>

      <Demo label="Horizontal">
        <ScrollArea className="h-20 w-80 rounded-lg border border-border bg-surface p-4">
          <div className="flex w-max gap-2">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="flex h-7 w-24 shrink-0 items-center justify-center rounded-md bg-surface-raised font-mono text-xs text-text-muted"
              >
                Chip {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Demo>

      <Demo label="Both axes (corner)">
        <ScrollArea className="h-44 w-80 rounded-lg border border-border bg-surface p-4">
          <div className="flex w-max flex-col gap-2">
            {Array.from({ length: 20 }, (_, r) => (
              <div key={r} className="flex w-max gap-2">
                {Array.from({ length: 12 }, (_, c) => (
                  <div
                    key={c}
                    className="flex h-7 w-20 shrink-0 items-center justify-center rounded-md bg-surface-raised font-mono text-xs text-text-muted"
                  >
                    {r + 1}·{c + 1}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Demo>
    </StoryShell>
  );
}
