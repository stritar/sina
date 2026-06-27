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

export default function ToastStory() {
  const [open, setOpen] = useState<Variant | null>(null);
  const Glyph = open ? ICON[open] : null;

  return (
    <StoryShell title="Toast">
      <ToastProvider>
        <Demo label="trigger a toast">
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

        {open ? (
          <Toast
            key={open}
            variant={open}
            open
            onOpenChange={(o) => !o && setOpen(null)}
            duration={4000}
          >
            {Glyph ? (
              <Glyph
                aria-hidden
                weight="fill"
                className={`mt-0.5 size-5 shrink-0 ${ICON_COLOR[open]}`}
              />
            ) : null}
            <div className="flex flex-col">
              <ToastTitle>
                {open === "success"
                  ? "Transfer authorized"
                  : open === "danger"
                    ? "Transfer blocked"
                    : "Validating intent…"}
              </ToastTitle>
              <ToastDescription>
                {open === "success"
                  ? "Wire to Acme Payroll · 8810 queued."
                  : open === "danger"
                    ? "Exceeds the single-transfer limit."
                    : "Checking the constitution."}
              </ToastDescription>
              {open !== "info" ? (
                <ToastAction altText="Take action">
                  {open === "success" ? "View receipt" : "Request approval"}
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
