"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Stack,
} from "@sina-design-system/core";
import { useState } from "react";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Dialog demos for /docs/primitives/dialog. Ported from the playground
 * story (apps/playground/app/primitives/dialog/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

export function DialogHero() {
  return (
    <Hero>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="primary">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Focus-trapped dialog</DialogTitle>
          <DialogDescription>
            Radix-backed: focus is trapped, Esc closes, and the trigger regains focus on close.
            Tab through — focus never escapes.
          </DialogDescription>
          <Stack direction="row" gap={2} justify="end">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Confirm</Button>
            </DialogClose>
          </Stack>
        </DialogContent>
      </Dialog>
    </Hero>
  );
}

export function DialogExamples() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Example
        label="Basic · Title + Description + Close"
        code={`<Dialog>
  <DialogTrigger asChild>
    <Button>Open dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Confirm action</DialogTitle>
    <DialogDescription>Review the details before continuing.</DialogDescription>
    <DialogClose asChild>
      <Button variant="secondary">Cancel</Button>
    </DialogClose>
    <DialogClose asChild>
      <Button>Confirm</Button>
    </DialogClose>
  </DialogContent>
</Dialog>`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              Review the details before continuing. This is a domain-agnostic shell.
            </DialogDescription>
            <Stack direction="row" gap={2} justify="end">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Confirm</Button>
              </DialogClose>
            </Stack>
          </DialogContent>
        </Dialog>
      </Example>

      <Example
        label="Scrollable content · ScrollArea inside a fixed height"
        code={`<DialogContent>
  <DialogTitle>Terms</DialogTitle>
  <DialogDescription>The body scrolls; the focus trap still holds.</DialogDescription>
  <ScrollArea style={{ height: 200 }}>
    {/* long content */}
  </ScrollArea>
  <DialogClose asChild>
    <Button>Done</Button>
  </DialogClose>
</DialogContent>`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open long dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Terms</DialogTitle>
            <DialogDescription>
              The body scrolls inside a fixed height; the focus trap still holds.
            </DialogDescription>
            <ScrollArea style={{ height: 200 }}>
              <Stack gap={2}>
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i}>
                    Paragraph {i + 1}. Tab cycles only through focusable elements inside the
                    dialog, proving the trap is intact even with overflowing content.
                  </p>
                ))}
              </Stack>
            </ScrollArea>
            <Stack direction="row" gap={2} justify="end">
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </Stack>
          </DialogContent>
        </Dialog>
      </Example>

      <Example
        label="Controlled · open / onOpenChange via external state"
        code={`const [open, setOpen] = useState(false);

<Button variant="secondary" onClick={() => setOpen(true)}>
  Open from external button
</Button>
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogTitle>Controlled dialog</DialogTitle>
    <DialogDescription>Driven by useState, not a DialogTrigger.</DialogDescription>
    <Button onClick={() => setOpen(false)}>Close</Button>
  </DialogContent>
</Dialog>`}
      >
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open from external button
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              This dialog is driven by useState, not a DialogTrigger.
            </DialogDescription>
            <Stack direction="row" gap={2} justify="end">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Example>

      <StorySource slug="dialog" />
    </>
  );
}
