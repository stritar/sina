"use client";

import { SecureWireDialog, type WireApprovalEvidence } from "@sina-design-system/fintech-react";
import { wireFixtures } from "@sina-design-system/fintech";
import { Demo, StoryShell } from "../_components/StoryShell";
import { regateWithApproval } from "../../(emulator)/_lib/regate";

// The escalated $60k intent the constitution forces into SecureWireDialog.
const intent = wireFixtures.overLimitTransfer;

const violations = [
  {
    code: "AMOUNT_REQUIRES_APPROVAL",
    message: "wire above $50,000 requires secondary managerial approval",
    standard: "SINA design hand-off (ROADMAP §Phase 3)",
    severity: "escalate" as const,
  },
];

export default function SecureWireDialogStory() {
  // The gate runs SERVER-SIDE (§1b). The story submits the approver's evidence to
  // the same re-gate the emulator uses — it does not decide anything locally.
  async function onSubmitApproval(evidence: WireApprovalEvidence) {
    const view = await regateWithApproval(intent, evidence);
    if (view.kind === "gate") {
      return { approved: view.trace.result.valid, violations: view.trace.result.violations };
    }
    return { approved: false, violations: [] };
  }

  return (
    <StoryShell title="SecureWireDialog">
      <Demo label="Governed wire approval (real server re-gate)">
        <SecureWireDialog intent={intent} violations={violations} onSubmitApproval={onSubmitApproval} />
        <p className="max-w-prose text-ui text-text-muted">
          Approve as any manager (e.g. <span className="font-mono text-text">mgr:dana</span>) → the
          server re-verifies the terms and the wire is governed. Approve as{" "}
          <span className="font-mono text-text">agent:opus</span> (the initiator) → the re-gate
          rejects it as self-approval. The binding hash is computed server-side, so the approval can
          only ever bind to the exact terms shown.
        </p>
      </Demo>
    </StoryShell>
  );
}
