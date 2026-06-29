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
} from "@sina-design-system/core";
import { useState } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";

const SIZES = [
  { width: "max-w-sm", label: "Small" },
  { width: "max-w-md", label: "Medium" },
  { width: "max-w-lg", label: "Large" },
] as const;

export default function DialogStory() {
  const [open, setOpen] = useState(false);

  return (
    <StoryShell title="Dialog">
      <Demo label="Basic (Title + Description + Close)">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              Review the details before continuing. This is a domain-agnostic shell.
            </DialogDescription>
            <div className="mt-2 flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Confirm</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </Demo>

      <Demo label="Sizes (max-w-sm · max-w-md · max-w-lg)">
        {SIZES.map((size) => (
          <Dialog key={size.width}>
            <DialogTrigger asChild>
              <Button variant="secondary">{size.label}</Button>
            </DialogTrigger>
            <DialogContent className={size.width}>
              <DialogTitle>{size.label} dialog</DialogTitle>
              <DialogDescription>
                This content overrides its width with className=&quot;{size.width}&quot;.
              </DialogDescription>
              <div className="mt-2 flex justify-end">
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </Demo>

      <Demo label="Scrollable content (ScrollArea inside a fixed height)">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open long dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Terms</DialogTitle>
            <DialogDescription>
              The body scrolls inside a fixed height; the focus trap still holds.
            </DialogDescription>
            <ScrollArea className="mt-3 h-24 rounded-md border border-border-subtle">
              <div className="flex flex-col gap-3 p-3">
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i} className="text-sm text-text-muted">
                    Paragraph {i + 1}. Tab cycles only through focusable elements
                    inside the dialog, proving the trap is intact even with
                    overflowing content.
                  </p>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-3 flex justify-end">
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </Demo>

      <Demo label="Controlled (open / onOpenChange via external state)">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open from external button
        </Button>
        <p className="font-mono text-xs text-text-subtle">
          open: {String(open)}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              This dialog is driven by useState, not a DialogTrigger.
            </DialogDescription>
            <div className="mt-2 flex justify-end">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Demo>
    </StoryShell>
  );
}
