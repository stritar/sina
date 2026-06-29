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
import { WarningCircle, CheckCircle, Info } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";

type Variant = "success" | "danger" | "info";

const ICON = { success: CheckCircle, danger: WarningCircle, info: Info } as const;
const ICON_COLOR = {
  success: "text-success",
  danger: "text-danger",
  info: "text-info",
} as const;

type ToastKey =
  | "success"
  | "danger"
  | "info"
  | "with-action"
  | "no-action"
  | "title-only";

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

export default function ToastStory() {
  const [open, setOpen] = useState<ToastKey | null>(null);
  const spec = open ? SPECS[open] : null;
  const Glyph = spec ? ICON[spec.variant] : null;
  const singleLine = spec ? !spec.description && !spec.action : false;

  return (
    <StoryShell title="Toast">
      <ToastProvider>
        <Demo label="variant (success · danger · info)">
          <Button variant="secondary" onClick={() => setOpen("success")}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => setOpen("danger")}>
            Danger
          </Button>
          <Button variant="secondary" onClick={() => setOpen("info")}>
            Info
          </Button>
        </Demo>

        <Demo label="action (with · without)">
          <Button variant="secondary" onClick={() => setOpen("with-action")}>
            With action
          </Button>
          <Button variant="secondary" onClick={() => setOpen("no-action")}>
            Without action
          </Button>
        </Demo>

        <Demo label="description (title only)">
          <Button variant="secondary" onClick={() => setOpen("title-only")}>
            Title only
          </Button>
        </Demo>

        {spec ? (
          <Toast
            key={open}
            variant={spec.variant}
            open
            onOpenChange={(o) => !o && setOpen(null)}
            duration={4000}
            className={singleLine ? "items-center" : undefined}
          >
            {Glyph ? (
              <Glyph
                aria-hidden
                weight="fill"
                className={`size-5 shrink-0 ${singleLine ? "" : "mt-0.5"} ${ICON_COLOR[spec.variant]}`}
              />
            ) : null}
            <div className="flex flex-col">
              <ToastTitle>{spec.title}</ToastTitle>
              {spec.description ? (
                <ToastDescription>{spec.description}</ToastDescription>
              ) : null}
              {spec.action ? (
                <ToastAction
                  asChild
                  altText={spec.action}
                  className="mt-1 self-start font-normal text-text"
                >
                  <Button variant="ghost" size="sm" className="-ml-1">
                    {spec.action}
                  </Button>
                </ToastAction>
              ) : null}
            </div>
            <ToastClose />
          </Toast>
        ) : null}
        <ToastViewport />
      </ToastProvider>
    </StoryShell>
  );
}
