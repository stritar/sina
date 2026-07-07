"use client";

/**
 * SecureWireDialog — the first end-to-end SINA governed component (Phase 5).
 *
 * Composes `core` primitives with the `fintech` wire constitution to run a
 * secondary managerial approval loop. It is the component the constitution
 * FORCES (`requiredComponent: "SecureWireDialog"`) when a wire escalates.
 *
 * The one invariant it must never break (§1b): **this component does not
 * validate anything.** It collects the approver's evidence and hands it to
 * `onSubmitApproval`, which re-runs the constitution SERVER-SIDE. The binding
 * hash that ties an approval to the exact terms is computed on the server (the
 * component never sends it), so a hostile stream cannot approve $5k and execute
 * $60k. A denied re-gate keeps the dialog open — the un-bypassable moment.
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

import { formatAmount, readWire } from "../format.js";
import styles from "./SecureWireDialog.module.css";

/** What the approver contributes. The initiator identity is server-known, never here. */
export interface WireApprovalEvidence {
  approverId: string;
  approverName: string;
  secondFactor?: string;
}

/** The server re-gate's decision, mapped down for the dialog to render. */
export interface SecureWireRegateResult {
  approved: boolean;
  violations: Violation[];
}

export interface SecureWireDialogProps {
  /** The escalated wire intent (the model's proposed payload, sans approval). */
  intent: unknown;
  /** The blocking violations the gate returned — shown as citations in review. */
  violations?: Violation[];
  /** Submit the approver's evidence to the SERVER re-gate. Returns the new decision. */
  onSubmitApproval: (evidence: WireApprovalEvidence) => Promise<SecureWireRegateResult>;
  /** Fired when the re-gate approves — lets a host swap the reply to the governed summary. */
  onApproved?: (result: SecureWireRegateResult) => void;
  /** Label for the trigger button. */
  triggerLabel?: ReactNode;
}

type Phase = "review" | "collect" | "pending" | "approved" | "denied" | "error";

const OTP_LENGTH = 6;

export function SecureWireDialog({
  intent,
  violations = [],
  onSubmitApproval,
  onApproved,
  triggerLabel = "Open SecureWireDialog",
}: SecureWireDialogProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("review");
  const [approverId, setApproverId] = useState("");
  const [approverName, setApproverName] = useState("");
  const [secondFactor, setSecondFactor] = useState("");
  const [busy, setBusy] = useState(false);
  const [denials, setDenials] = useState<Violation[]>([]);

  const wire = readWire(intent);
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
        setDenials(result.violations.filter((v) => v.severity === "reject" || v.severity === "escalate"));
        setPhase("denied");
      }
    } catch {
      setPhase("error");
    } finally {
      setBusy(false);
    }
  }

  const terms = (
    <SummaryList
      items={[
        { label: "Amount", value: formatAmount(wire.amount, wire.currency), emphasis: true },
        { label: "Currency", value: wire.currency },
        { label: "From", value: wire.debtor.name ?? "—" },
        { label: "To", value: wire.creditor.name ?? "—" },
        { label: "Rail", value: (wire.debtor.scheme ?? "—").toUpperCase() },
      ]}
    />
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" iconLeft={<Lock className={styles.icon} />}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Secondary approval required</DialogTitle>
        <DialogDescription>
          This wire exceeds the approval threshold. A second party must approve it before SINA will
          mount the transfer — the initiator cannot approve their own wire.
        </DialogDescription>

        <Stack direction="col" gap={3} className={styles.body}>
          {terms}

          {phase === "review" && (
            <>
              <Alert variant="warning" title="Why this is blocked">
                {blocking.length > 0
                  ? "This wire exceeds the approval threshold and requires secondary approval before it can proceed."
                  : "Wires above $50,000 require secondary managerial approval."}
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
                <Button onClick={() => setPhase("collect")}>Request approval</Button>
              </Footer>
            </>
          )}

          {phase === "collect" && (
            <>
              <TextField
                label="Approver ID"
                description="The manager approving this wire. Must differ from the initiator."
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
              />
              <TextField
                label="Approver name"
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
                  Send for approval
                </Button>
              </Footer>
            </>
          )}

          {phase === "pending" && (
            <>
              <Stack direction="col" gap={2}>
                <span className={styles.fieldLabel}>Approver second factor</span>
                <CredentialOTP
                  length={OTP_LENGTH}
                  value={secondFactor}
                  onChange={setSecondFactor}
                  aria-label="Approver one-time code"
                />
                <span className={styles.hint}>
                  Approving binds to the exact terms above; SINA re-verifies server-side.
                </span>
              </Stack>
              <Footer>
                <Button variant="secondary" onClick={() => setPhase("collect")} disabled={busy}>
                  Back
                </Button>
                <Button
                  loading={busy}
                  disabled={secondFactor.length !== OTP_LENGTH}
                  onClick={submit}
                >
                  Approve
                </Button>
              </Footer>
            </>
          )}

          {phase === "approved" && (
            <>
              <Alert variant="success" title="Approved & governed">
                Approved by {approverName || approverId}. SINA re-verified the terms server-side and
                mounted the transfer.
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
              <Alert variant="danger" title="Approval rejected">
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
                The approval could not be submitted. This is a transport error, not a governance
                decision — the wire is still blocked.
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
