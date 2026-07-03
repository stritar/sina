"use client";

/**
 * MandatoryDisclosure — the governed component for consent / regulatory
 * disclosures (Phase 6, workstream E).
 *
 * Regulatory text (Reg E, Truth-in-Lending, an FX-spread disclosure) the model
 * **cannot alter or omit**: SINA carries the verbatim `body` on the intent, the
 * constitution escalates until it is acknowledged, and this component renders the
 * text and collects the attestation. On acknowledge it re-runs the constitution
 * SERVER-SIDE (`onSubmitApproval`) — the client never decides the disclosure is
 * satisfied. A denied re-gate keeps the block in place.
 *
 * Renders every paragraph as **text**, never `dangerouslySetInnerHTML`.
 */

import { useState, type ReactNode } from "react";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Stack,
} from "@sina-design-system/core";
import type { Violation } from "@sina-design-system/governance";

import type { GovernedActionRegateResult } from "../GovernedActionDialog/GovernedActionDialog.js";

/** What the actor attests. The gate re-verifies server-side. */
export interface DisclosureAcknowledgement {
  acknowledged: true;
}

export interface MandatoryDisclosureProps {
  /** The escalated disclosure intent (carries the verbatim text SINA injected). */
  intent: unknown;
  /** The blocking violations the gate returned. */
  violations?: Violation[];
  /** Submit the acknowledgement to the SERVER re-gate. Returns the new decision. */
  onSubmitApproval: (evidence: DisclosureAcknowledgement) => Promise<GovernedActionRegateResult>;
  /** Fired when the re-gate accepts the acknowledgement. */
  onApproved?: (result: GovernedActionRegateResult) => void;
  /** Label for the trigger button. */
  triggerLabel?: ReactNode;
}

type Phase = "review" | "approved" | "denied" | "error";

interface DisclosureView {
  title: string;
  body: string[];
  version: string;
}

/** Read the disclosure off the intent, tolerating a hostile shape. */
function readDisclosure(intent: unknown): DisclosureView {
  const d = (intent ?? {}) as Record<string, unknown>;
  const body = Array.isArray(d.body)
    ? d.body.filter((p): p is string => typeof p === "string")
    : typeof d.body === "string"
      ? [d.body]
      : [];
  return {
    title: typeof d.title === "string" ? d.title : "Required disclosure",
    body,
    version: typeof d.version === "string" ? d.version : "—",
  };
}

export function MandatoryDisclosure({
  intent,
  violations = [],
  onSubmitApproval,
  onApproved,
  triggerLabel = "Review disclosure",
}: MandatoryDisclosureProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("review");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [denials, setDenials] = useState<Violation[]>([]);

  const disclosure = readDisclosure(intent);
  const blocking = violations.filter((v) => v.severity === "reject" || v.severity === "escalate");

  function reset() {
    setPhase("review");
    setAccepted(false);
    setDenials([]);
    setBusy(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset();
  }

  async function submit() {
    setBusy(true);
    try {
      const result = await onSubmitApproval({ acknowledged: true });
      if (result.approved) {
        setPhase("approved");
        onApproved?.(result);
      } else {
        setDenials(
          result.violations.filter((v) => v.severity === "reject" || v.severity === "escalate"),
        );
        setPhase("denied");
      }
    } catch {
      setPhase("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" iconLeft={<FileText className="size-control-2xs" />}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>{disclosure.title}</DialogTitle>
        <DialogDescription>
          SINA injects this disclosure verbatim — the agent cannot alter or omit it. You must
          acknowledge it before the action proceeds.
        </DialogDescription>

        <Stack direction="col" gap={3} className="mt-3">
          {phase === "review" && (
            <>
              <ScrollArea className="max-h-56 rounded-lg border border-border-subtle bg-surface-sunken p-3">
                <Stack direction="col" gap={2}>
                  {disclosure.body.length > 0 ? (
                    disclosure.body.map((paragraph, i) => (
                      <p key={i} className="text-ui text-text-muted">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-ui text-text-muted">No disclosure text was provided.</p>
                  )}
                  <p className="text-xs text-text-subtle">Version {disclosure.version}</p>
                </Stack>
              </ScrollArea>

              {blocking.length > 0 && (
                <Alert variant="warning" title="Why this is blocked">
                  {blocking[0]?.message}
                </Alert>
              )}

              <Checkbox
                checked={accepted}
                onCheckedChange={(next) => setAccepted(next === true)}
                label="I have read and accept this disclosure."
              />

              <Footer>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <Button loading={busy} disabled={!accepted} onClick={submit}>
                  Acknowledge & continue
                </Button>
              </Footer>
            </>
          )}

          {phase === "approved" && (
            <>
              <Alert variant="success" title="Acknowledged & governed">
                SINA recorded the acknowledgement server-side and mounted the action.
              </Alert>
              <Footer>
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              </Footer>
            </>
          )}

          {phase === "denied" && (
            <>
              <Alert variant="danger" title="Still blocked">
                <Stack direction="col" gap={1} as="ul">
                  {denials.map((v, i) => (
                    <li key={i}>{v.message}</li>
                  ))}
                </Stack>
              </Alert>
              <Footer>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <Button onClick={reset}>Back</Button>
              </Footer>
            </>
          )}

          {phase === "error" && (
            <>
              <Alert variant="danger" title="Could not reach the gate">
                The acknowledgement could not be submitted. This is a transport error, not a
                governance decision — the action is still blocked.
              </Alert>
              <Footer>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <Button onClick={reset}>Retry</Button>
              </Footer>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-1 flex items-center justify-end gap-2">{children}</div>;
}
