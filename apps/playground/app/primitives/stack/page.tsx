import { Stack } from "@sina-design-system/core";
import type { ComponentProps } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";

type GapStep = NonNullable<ComponentProps<typeof Stack>["gap"]>;
type Align = NonNullable<ComponentProps<typeof Stack>["align"]>;
type Justify = NonNullable<ComponentProps<typeof Stack>["justify"]>;

const GAPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const;
const ALIGNS = ["start", "center", "end", "stretch", "baseline"] as const;
const JUSTIFIES = ["start", "center", "end", "between", "around"] as const;

function Box({ className }: { className?: string }) {
  return <div className={`h-7 w-40 rounded-md bg-surface-raised ${className ?? ""}`} />;
}

export default function StackStory() {
  return (
    <StoryShell title="Stack">
      <Demo label="Gap steps">
        <div className="flex w-full flex-col gap-4">
          {GAPS.map((g) => (
            <div key={g} className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
                gap {g}
              </span>
              <Stack direction="row" gap={g as GapStep}>
                <Box className="w-24" />
                <Box className="w-24" />
                <Box className="w-24" />
              </Stack>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Direction">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
              row
            </span>
            <Stack direction="row" gap={3}>
              <Box className="w-24" />
              <Box className="w-24" />
              <Box className="w-24" />
            </Stack>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
              col
            </span>
            <Stack direction="col" gap={3}>
              <Box />
              <Box />
              <Box />
            </Stack>
          </div>
        </div>
      </Demo>

      <Demo label="Align">
        <div className="flex w-full flex-col gap-4">
          {ALIGNS.map((a) => (
            <div key={a} className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
                align {a}
              </span>
              <Stack
                direction="row"
                gap={3}
                align={a as Align}
                className="h-16 rounded-md bg-bg p-2"
              >
                <div className="h-7 w-16 rounded-md bg-surface-raised" />
                <div className="h-12 w-16 rounded-md bg-surface-raised" />
                <div className="h-9 w-16 rounded-md bg-surface-raised" />
              </Stack>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Justify">
        <div className="flex w-full flex-col gap-4">
          {JUSTIFIES.map((j) => (
            <div key={j} className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
                justify {j}
              </span>
              <Stack
                direction="row"
                gap={3}
                justify={j as Justify}
                className="w-full rounded-md border border-border-subtle bg-bg p-2"
              >
                <div className="h-7 w-16 rounded-md bg-surface-raised" />
                <div className="h-7 w-16 rounded-md bg-surface-raised" />
                <div className="h-7 w-16 rounded-md bg-surface-raised" />
              </Stack>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Wrap">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
              wrap
            </span>
            <Stack direction="row" gap={2} wrap className="w-80 rounded-md bg-bg p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="h-7 w-24 rounded-md bg-surface-raised" />
              ))}
            </Stack>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-subtle">
              no wrap
            </span>
            <Stack direction="row" gap={2} className="w-80 overflow-hidden rounded-md bg-bg p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="h-7 w-24 shrink-0 rounded-md bg-surface-raised" />
              ))}
            </Stack>
          </div>
        </div>
      </Demo>
    </StoryShell>
  );
}
