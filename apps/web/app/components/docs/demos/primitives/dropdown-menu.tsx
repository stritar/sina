"use client";

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
import { Example, Hero, StorySource } from "../shell";

/**
 * Live DropdownMenu demos for /docs/primitives/dropdown-menu. Ported from the
 * playground story (apps/playground/app/primitives/dropdown-menu/page.tsx) —
 * keep the two in step when the primitive's prop surface changes.
 */

export function DropdownMenuHero() {
  return (
    <Hero>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Page actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>View as Markdown</DropdownMenuItem>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Open in Claude</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Hero>
  );
}

export function DropdownMenuExamples() {
  return (
    <>
      <Example
        label="Basic · a trigger and a list of commands"
        code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="secondary">Open menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Alpha</DropdownMenuItem>
    <DropdownMenuItem>Bravo</DropdownMenuItem>
    <DropdownMenuItem>Charlie</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
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
      </Example>

      <Example
        label="Grouped · DropdownMenuGroup + DropdownMenuLabel + DropdownMenuSeparator"
        code={`<DropdownMenu>
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
</DropdownMenu>`}
      >
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
      </Example>

      <Example
        label="Links · an item can be an anchor via asChild"
        code={`<DropdownMenuContent>
  <DropdownMenuItem asChild>
    <a href="/llms/docs/index.md" target="_blank" rel="noreferrer">
      View as Markdown
    </a>
  </DropdownMenuItem>
  <DropdownMenuItem disabled>Unavailable action</DropdownMenuItem>
</DropdownMenuContent>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Menu with a link</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <a href="/llms/docs/index.md" target="_blank" rel="noreferrer">
                View as Markdown
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Unavailable action</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Example>

      <Example
        label="Alignment · align and side are forwarded to Radix"
        code={`<DropdownMenuContent align="start" side="bottom">
  <DropdownMenuItem>Aligned to the trigger's start edge</DropdownMenuItem>
</DropdownMenuContent>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Start-aligned</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Aligned to the trigger&apos;s start edge</DropdownMenuItem>
            <DropdownMenuItem>Second command</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Example>

      <StorySource slug="dropdown-menu" />
    </>
  );
}
