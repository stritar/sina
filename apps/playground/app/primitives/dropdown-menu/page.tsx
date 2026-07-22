import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function DropdownMenuStory() {
  return (
    <StoryShell title="DropdownMenu">
      <Demo label="Basic (a trigger and a list of commands)">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Alpha</DropdownMenuItem>
            <DropdownMenuItem>Bravo</DropdownMenuItem>
            <DropdownMenuItem>Charlie</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Demo>

      <Demo label="Grouped (DropdownMenuGroup + DropdownMenuLabel + DropdownMenuSeparator)">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Grouped menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>This page</DropdownMenuLabel>
              <DropdownMenuItem>View as Markdown</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Hand off</DropdownMenuLabel>
              <DropdownMenuItem>Open in Claude</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Demo>

      <Demo label="Link item (asChild) + disabled item">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Menu with a link</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <a href="https://sinahub.app" target="_blank" rel="noreferrer">
                Open sinahub.app
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Unavailable action</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Demo>

      <Demo label="Alignment (align='start' forwarded to Radix)">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Start-aligned</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Aligned to the trigger&apos;s start edge</DropdownMenuItem>
            <DropdownMenuItem>Second command</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Demo>
    </StoryShell>
  );
}
