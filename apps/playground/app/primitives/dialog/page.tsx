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
import styles from "./page.module.css";

const SIZES = [
  { cls: styles.sm, name: "max-w-sm", label: "Small" },
  { cls: styles.md, name: "max-w-md", label: "Medium" },
  { cls: styles.lg, name: "max-w-lg", label: "Large" },
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
            <div className={styles.actionsGap}>
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
          <Dialog key={size.name}>
            <DialogTrigger asChild>
              <Button variant="secondary">{size.label}</Button>
            </DialogTrigger>
            <DialogContent className={size.cls}>
              <DialogTitle>{size.label} dialog</DialogTitle>
              <DialogDescription>
                This content overrides its width with className=&quot;{size.name}&quot;.
              </DialogDescription>
              <div className={styles.actions}>
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
            <ScrollArea className={styles.scroll}>
              <div className={styles.scrollBody}>
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i} className={styles.para}>
                    Paragraph {i + 1}. Tab cycles only through focusable elements
                    inside the dialog, proving the trap is intact even with
                    overflowing content.
                  </p>
                ))}
              </div>
            </ScrollArea>
            <div className={styles.actionsMt3}>
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
        <p className={styles.state}>
          open: {String(open)}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              This dialog is driven by useState, not a DialogTrigger.
            </DialogDescription>
            <div className={styles.actions}>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Demo>
    </StoryShell>
  );
}
