import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function TooltipStory() {
  return (
    <StoryShell title="Tooltip">
      <TooltipProvider delayDuration={200}>
        <Demo label="Sides (top · right · bottom · left)">
          <div className={styles.sidesGrid}>
            {SIDES.map((side) => (
              <div key={side} className={styles.cell}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary">side={side}</Button>
                  </TooltipTrigger>
                  <TooltipContent side={side}>Anchored to the {side}</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </Demo>

        <Demo label="sideOffset (extra gap from the trigger)">
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
        </Demo>

        <Demo label="align (start · center · end)">
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
        </Demo>
      </TooltipProvider>
    </StoryShell>
  );
}
