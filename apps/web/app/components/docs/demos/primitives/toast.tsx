"use client";

import {
  Button,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@sina-design-system/core";
import { useState } from "react";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Toast demos for /docs/primitives/toast. Ported from the playground
 * story (apps/playground/app/primitives/toast/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

type Variant = "success" | "danger" | "info";

type ToastKey = "success" | "danger" | "info" | "with-action" | "no-action" | "title-only";

type ToastSpec = {
  variant: Variant;
  title: string;
  description?: string;
  action?: string;
};

const SPECS: Record<ToastKey, ToastSpec> = {
  success: {
    variant: "success",
    title: "Saved",
    description: "Your changes were stored.",
    action: "View",
  },
  danger: {
    variant: "danger",
    title: "Action blocked",
    description: "The request did not pass validation.",
    action: "Retry",
  },
  info: {
    variant: "info",
    title: "Working…",
    description: "Processing your request.",
  },
  "with-action": {
    variant: "info",
    title: "Item archived",
    description: "It was moved out of your inbox.",
    action: "Undo",
  },
  "no-action": {
    variant: "info",
    title: "Sync complete",
    description: "Everything is up to date.",
  },
  "title-only": {
    variant: "success",
    title: "Copied to clipboard",
  },
};

export function ToastHero() {
  const [open, setOpen] = useState(false);

  return (
    <Hero>
      <ToastProvider>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Show toast
        </Button>
        <Toast variant="success" open={open} onOpenChange={setOpen} duration={4000}>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Your changes were stored.</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </Hero>
  );
}

export function ToastExamples() {
  const [open, setOpen] = useState<ToastKey | null>(null);
  const spec = open ? SPECS[open] : null;

  return (
    <ToastProvider>
      <Example
        label="Variants · success / danger / info"
        code={`<ToastProvider>
  <Toast variant="success" open={open} onOpenChange={setOpen}>
    <ToastTitle>Saved</ToastTitle>
    <ToastDescription>Your changes were stored.</ToastDescription>
    <ToastClose />
  </Toast>
  <ToastViewport />
</ToastProvider>`}
      >
        <Button variant="secondary" onClick={() => setOpen("success")}>
          Success
        </Button>
        <Button variant="secondary" onClick={() => setOpen("danger")}>
          Danger
        </Button>
        <Button variant="secondary" onClick={() => setOpen("info")}>
          Info
        </Button>
      </Example>

      <Example
        label="Action · with / without"
        code={`<Toast variant="info" open={open} onOpenChange={setOpen}>
  <ToastTitle>Item archived</ToastTitle>
  <ToastDescription>It was moved out of your inbox.</ToastDescription>
  <ToastAction asChild altText="Undo">
    <Button variant="primary" size="sm">Undo</Button>
  </ToastAction>
  <ToastClose />
</Toast>`}
      >
        <Button variant="secondary" onClick={() => setOpen("with-action")}>
          With action
        </Button>
        <Button variant="secondary" onClick={() => setOpen("no-action")}>
          Without action
        </Button>
      </Example>

      <Example
        label="Title only · no description"
        code={`<Toast variant="success" open={open} onOpenChange={setOpen}>
  <ToastTitle>Copied to clipboard</ToastTitle>
  <ToastClose />
</Toast>`}
      >
        <Button variant="secondary" onClick={() => setOpen("title-only")}>
          Title only
        </Button>
      </Example>

      {spec ? (
        <Toast
          key={open}
          variant={spec.variant}
          open
          onOpenChange={(o) => !o && setOpen(null)}
          duration={4000}
        >
          <ToastTitle>{spec.title}</ToastTitle>
          {spec.description ? <ToastDescription>{spec.description}</ToastDescription> : null}
          {spec.action ? (
            <ToastAction asChild altText={spec.action}>
              <Button variant="primary" size="sm">
                {spec.action}
              </Button>
            </ToastAction>
          ) : null}
          <ToastClose />
        </Toast>
      ) : null}
      <ToastViewport />

      <StorySource slug="toast" />
    </ToastProvider>
  );
}
