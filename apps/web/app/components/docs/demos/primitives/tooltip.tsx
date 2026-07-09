"use client";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Tooltip demos for /docs/primitives/tooltip. Ported from the playground
 * story (apps/playground/app/primitives/tooltip/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

const SIDES = ["top", "right", "bottom", "left"] as const;

export function TooltipHero() {
  return (
    <Hero>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Hover or focus me</Button>
          </TooltipTrigger>
          <TooltipContent>A short, supplementary hint.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Hero>
  );
}

export function TooltipExamples() {
  return (
    <TooltipProvider delayDuration={200}>
      <Example
        label="Sides · top / right / bottom / left"
        code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="secondary">side=top</Button>
  </TooltipTrigger>
  <TooltipContent side="top">Anchored to the top</TooltipContent>
</Tooltip>`}
      >
        {SIDES.map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="secondary">side={side}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>Anchored to the {side}</TooltipContent>
          </Tooltip>
        ))}
      </Example>

      <Example
        label="sideOffset · extra gap from the trigger"
        code={`<TooltipContent side="bottom">sideOffset default</TooltipContent>
<TooltipContent side="bottom" sideOffset={12}>sideOffset=12</TooltipContent>`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Default offset</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">sideOffset default</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Offset 12</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={12}>
            sideOffset=12
          </TooltipContent>
        </Tooltip>
      </Example>

      <Example
        label="align · start / center / end"
        code={`<TooltipContent side="bottom" align="start">Aligned to the start edge</TooltipContent>
<TooltipContent side="bottom" align="center">Centered on the trigger</TooltipContent>
<TooltipContent side="bottom" align="end">Aligned to the end edge</TooltipContent>`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">align start</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            Aligned to the start edge
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">align center</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Centered on the trigger
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">align end</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Aligned to the end edge
          </TooltipContent>
        </Tooltip>
      </Example>

      <StorySource slug="tooltip" />
    </TooltipProvider>
  );
}
