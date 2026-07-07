"use client";

/**
 * GovernedActionDialog — the generalized SINA governed component (Phase 6).
 *
 * The `SecureWireDialog` mechanics (review the blocked terms → collect a step-up
 * → re-gate server-side → render the verdict), reused across the whole governed
 * family (ACH/P2P/bill-pay/FX/withdrawals, card ops, limit/security changes,
 * trades, B2B approvals). It is the component the constitution FORCES when any of
 * those actions escalates; the registry maps each flow's `requiredComponent` to it.
 *
 * The one invariant (§1b): **this component does not validate anything.** It reads
 * the escalated intent's terms defensively, collects the authorizer's evidence,
 * and hands it to `onSubmit`, which re-runs the constitution SERVER-SIDE. The
 * binding hash that ties an authorization to the exact terms is computed on the
 * server (the component never sends it), so a hostile stream cannot authorize a
 * small action and execute a large one. A denied re-gate keeps the block in place.
 */

import { useState, type ReactNode } from "react";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import {
  Alert,
  Badge,
  Button,
  CredentialOTP,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Stack,
  SummaryList,
  TextField,
} from "@sina-design-system/core";
import type { Violation } from "@sina-design-system/governance";

import { deriveActionTerms } from "../format.js";
import styles from "./GovernedActionDialog.module.css";

/** What the authorizer contributes. The initiator identity is server-known, never here. */
export interface GovernedActionEvidence {
  approverId: string;
  approverName: string;
  secondFactor?: string;
}

/** The server re-gate's decision, mapped down for the dialog to render. */
export interface GovernedActionRegateResult {
  approved: boolean;
  violations: Violation[];
}

export interface GovernedActionDialogProps {
  /** The escalated action intent (the model's proposed payload, sans step-up). */
  intent: unknown;
  /** The blocking violations the gate returned — shown as citations in review. */
  violations?: Violation[];
  /** Dialog heading (defaults to a generic governed-action title). */
  title?: string;
  /** Sub-heading explaining why the action is gated. */
  description?: string;
  /** Submit the authorizer's evidence to the SERVER re-gate. Returns the new decision. */
  onSubmitApproval: (evidence: GovernedActionEvidence) => Promise<GovernedActionRegateResult>;
  /** Fired when the re-gate approves — lets a host swap the reply to the governed summary. */
  onApproved?: (result: GovernedActionRegateResult) => void;
  /** Label for the trigger button. */
  triggerLabel?: ReactNode;
}

type Phase = "review" | "collect" | "pending" | "approved" | "denied" | "error";

const OTP_LENGTH = 6;

export function GovernedActionDialog({
  intent,
  violations = [],
  title = "Authorization required",
  description = "This action exceeds a governed threshold. It must be authorized before SINA will mount it — the initiator cannot authorize their own action.",
  onSubmitApproval,
  onApproved,
  triggerLabel = "Review & authorize",
}: GovernedActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("review");
  const [approverId, setApproverId] = useState("");
  const [approverName, setApproverName] = useState("");
  const [secondFactor, setSecondFactor] = useState("");
  const [busy, setBusy] = useState(false);
  const [denials, setDenials] = useState<Violation[]>([]);

  const terms = deriveActionTerms(intent);
  const blocking = violations.filter((v) => v.severity === "reject" || v.severity === "escalate");

  function reset() {
    setPhase("review");
    setApproverId("");
    setApproverName("");
    setSecondFactor("");
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
      const result = await onSubmitApproval({
        approverId: approverId.trim(),
        approverName: approverName.trim(),
        secondFactor: secondFactor || undefined,
      });
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
        <Button variant="secondary" size="sm" iconLeft={<Lock className={styles.icon} />}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>

        <Stack direction="col" gap={3} className={styles.body}>
          <SummaryList items={terms} />

          {phase === "review" && (
            <>
              <Alert variant="warning" title="Why this is blocked">
                {blocking.length > 0
                  ? "This action exceeds a governed threshold and requires authorization before it can proceed."
                  : "This action requires authorization before it can proceed."}
              </Alert>
              {blocking.length > 0 && (
                // Severity Badges are SIBLINGS of the Alert, never nested inside it —
                // status elements never wrap other status elements (mirrors BlockedState).
                // See CLAUDE.md "Never nest status elements inside one another".
                <Stack direction="col" gap={2} as="ul" className={styles.violations}>
                  {blocking.map((v, i) => (
                    <li key={i} className={styles.violationRow}>
                      <Badge intent="danger" size="sm">
                        <span className={styles.severity}>{v.severity}</span>
                      </Badge>
                      <span>{v.message}</span>
                    </li>
                  ))}
                </Stack>
              )}
              <Footer>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <Button onClick={() => setPhase("collect")}>Request authorization</Button>
              </Footer>
            </>
          )}

          {phase === "collect" && (
            <>
              <TextField
                label="Authorizer ID"
                description="The party authorizing this action. Must differ from the initiator."
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
              />
              <TextField
                label="Authorizer name"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
              />
              <Footer>
                <Button variant="secondary" onClick={() => setPhase("review")}>
                  Back
                </Button>
                <Button
                  disabled={!approverId.trim() || !approverName.trim()}
                  onClick={() => setPhase("pending")}
                >
                  Continue
                </Button>
              </Footer>
            </>
          )}

          {phase === "pending" && (
            <>
              <Stack direction="col" gap={2}>
                <span className={styles.fieldLabel}>Authorizer second factor</span>
                <CredentialOTP
                  length={OTP_LENGTH}
                  value={secondFactor}
                  onChange={setSecondFactor}
                  aria-label="Authorizer one-time code"
                />
                <span className={styles.hint}>
                  Authorizing binds to the exact terms above; SINA re-verifies server-side.
                </span>
              </Stack>
              <Footer>
                <Button variant="secondary" onClick={() => setPhase("collect")} disabled={busy}>
                  Back
                </Button>
                <Button loading={busy} disabled={secondFactor.length !== OTP_LENGTH} onClick={submit}>
                  Authorize
                </Button>
              </Footer>
            </>
          )}

          {phase === "approved" && (
            <>
              <Alert variant="success" title="Authorized & governed">
                Authorized by {approverName || approverId}. SINA re-verified the terms server-side and
                mounted the action.
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
              <Alert variant="danger" title="Authorization rejected">
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
                <Button onClick={reset}>Back to review</Button>
              </Footer>
            </>
          )}

          {phase === "error" && (
            <>
              <Alert variant="danger" title="Could not reach the gate">
                The authorization could not be submitted. This is a transport error, not a governance
                decision — the action is still blocked.
              </Alert>
              <Footer>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <Button onClick={() => setPhase("pending")}>Retry</Button>
              </Footer>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return <div className={styles.footer}>{children}</div>;
}
