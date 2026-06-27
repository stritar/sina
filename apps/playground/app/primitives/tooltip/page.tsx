import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function TooltipStory() {
  return (
    <StoryShell title="Tooltip">
      <TooltipProvider delayDuration={200}>
        <Demo label="pointer down (top side)">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary">Why blocked?</Button>
            </TooltipTrigger>
            <TooltipContent side="top">Exceeds the single-transfer limit</TooltipContent>
          </Tooltip>
        </Demo>
        <Demo label="pointer up (bottom side)">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary">Approval</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Requires secondary approval</TooltipContent>
          </Tooltip>
        </Demo>
      </TooltipProvider>
    </StoryShell>
  );
}
