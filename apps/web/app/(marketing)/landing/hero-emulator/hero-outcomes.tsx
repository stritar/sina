import { Warning, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import { SummaryList, type SummaryItem } from "@sina-design-system/core";
import { SecureWireDialog } from "@sina-design-system/fintech-react";
import type { Violation } from "@sina-design-system/governance";
import { ChatBubble, GateCard } from "../../broadsheet";
import { heroEmulator as copy } from "../copy";
import type { EmulatorScenario, EmulatorTrace } from "../emulator/types";
import styles from "./HeroEmulator.module.css";

/** The escalated wire intent the real SecureWireDialog reviews (catalog fixture). */
const OVER_LIMIT_WIRE_INTENT = {
  amount: 6000000,
  currency: "USD",
  debtor: { name: "Acme Corp" },
  creditor: { name: "Beta LLC" },
};

/**
 * What renders once the gate decided, per scenario id:
 *  - `summary`         → the confirm/read card the pass mounts (a SummaryList).
 *  - `secure-wire-dialog` → the REAL fintech-react governed dialog (the payoff).
 *  - `simulated-mount` → a non-interactive card showing the ANATOMY of the
 *    governed component SINA would mount for a non-fintech escalation: the terms
 *    it would bind and the step-up it would collect, in the same order as
 *    SecureWireDialog's review phase. No such component exists yet, so the card
 *    carries no buttons and no inputs — not even disabled ones, since a control
 *    that collects nothing is the same lie as a fake button. It describes the
 *    step-up rather than simulating it, and says so on its face.
 */
type HeroOutcome =
  | { kind: "summary"; items: SummaryItem[] }
  | { kind: "secure-wire-dialog" }
  | {
      kind: "simulated-mount";
      /** Component name. Must match the scenario's `mount` in simulated.ts. */
      mount: string;
      title: string;
      description: string;
      /** The terms the dialog would bind, drawn from the scenario's payload. */
      terms: SummaryItem[];
      /** What the dialog's step-up would gather from the approver. */
      collects: string[];
    };

const HERO_OUTCOME: Record<string, HeroOutcome> = {
  // Fintech
  small: {
    kind: "summary",
    items: [
      { label: "Amount", value: "$500.00", emphasis: true },
      { label: "From", value: "Acme Corp" },
      { label: "To", value: "Beta LLC" },
    ],
  },
  "over-limit": { kind: "secure-wire-dialog" },
  // Healthcare
  "medication-list": {
    kind: "summary",
    items: [
      { label: "Patient", value: "Maria Chen" },
      { label: "Lisinopril", value: "10 mg · daily" },
      { label: "Metformin", value: "500 mg · twice daily" },
    ],
  },
  "high-dose-order": {
    kind: "simulated-mount",
    mount: "CoSignDialog",
    title: "Pharmacist co-signature required",
    description:
      "The order is held until a pharmacist signs it, and the signature binds to the exact dose below.",
    terms: [
      { label: "Patient", value: "pt_4821" },
      { label: "Drug", value: "hydromorphone" },
      { label: "Dose", value: "12 mg", emphasis: true },
      { label: "Route", value: "IV" },
    ],
    collects: ["Pharmacist ID", "Pharmacist name", "6 digit co-sign code"],
  },
  // Defense
  "convoy-manifest": {
    kind: "summary",
    items: [
      { label: "Rations", value: "300 cases" },
      { label: "Comms equipment", value: "Confidential" },
      { label: "Guidance modules", value: "Withheld, logged", emphasis: true },
    ],
  },
  "munitions-transfer": {
    kind: "simulated-mount",
    mount: "DualAuthDialog",
    title: "Second officer approval required",
    description:
      "The transfer is held until a second officer signs it. The officer who drafted it cannot be that signer.",
    terms: [
      { label: "NSN", value: "1305-01-155-5459" },
      { label: "Item", value: "5.56mm ball" },
      { label: "Quantity", value: "40 cases", emphasis: true },
      { label: "From", value: "Depot A" },
      { label: "To", value: "Depot B" },
    ],
    collects: ["Second officer ID", "Officer name", "6 digit authorization code"],
  },
};

/** The gate's decision for a turn, inline in the thread (the machine lane). */
export function TurnGate({ trace }: { trace: EmulatorTrace }) {
  const meta = `${trace.latencyMs} ms · simulated`;
  if (trace.verdict === "escalate") {
    return (
      <GateCard
        className={styles.gate}
        size="sm"
        kicker={copy.gateKicker}
        status="escalate"
        statusIcon={<Warning weight="bold" />}
        mount={trace.mount ?? undefined}
        violations={trace.violations}
        meta={meta}
      />
    );
  }
  if (trace.verdict === "reject") {
    return (
      <GateCard
        className={styles.gate}
        size="sm"
        kicker={copy.gateKicker}
        status="reject"
        statusIcon={<WarningOctagon weight="bold" />}
        violations={trace.violations}
        meta={meta}
      />
    );
  }
  return (
    <GateCard
      className={styles.gate}
      size="sm"
      kicker={copy.gateKicker}
      status="pass"
      mount={trace.mount ?? undefined}
      violations={trace.violations}
      meta={meta}
    />
  );
}

/**
 * The thread's reply once a visitor drove the governed dialog to an approval.
 * Plain text on purpose: the dialog already showed a success Alert, and a
 * status element never wraps another (CLAUDE.md "Never nest status elements").
 */
export function ApprovalReply() {
  return (
    <ChatBubble variant="outcome" size="sm">
      <p className={styles.prompt}>{copy.wireApproved}</p>
    </ChatBubble>
  );
}

/** What the user sees once the gate decided: the confirm card, or the dialog. */
export function TurnOutcome({
  scenario,
  trace,
  onApproved,
}: {
  scenario: EmulatorScenario;
  trace: EmulatorTrace;
  /** Fired when this turn's governed dialog re-gate approves. */
  onApproved?: () => void;
}) {
  const outcome = HERO_OUTCOME[scenario.id];
  if (!outcome) return null;

  if (outcome.kind === "summary") {
    return (
      <ChatBubble variant="outcome" size="sm">
        <SummaryList items={outcome.items} />
      </ChatBubble>
    );
  }

  if (outcome.kind === "secure-wire-dialog") {
    return (
      <ChatBubble variant="outcome" size="sm">
        <div className={styles.dialogRow}>
          <SecureWireDialog
            intent={OVER_LIMIT_WIRE_INTENT}
            violations={trace.violations as Violation[]}
            onSubmitApproval={async () => ({ approved: true, violations: [] })}
            onApproved={onApproved}
            triggerLabel="Review and approve"
          />
          <span className={styles.caption}>{copy.wireApproval}</span>
        </div>
      </ChatBubble>
    );
  }

  return (
    <ChatBubble variant="outcome" size="sm">
      <div className={styles.simCard}>
        {/*
         * The gate card directly above already cites the violation and its
         * standard, and the panel header carries a persistent "Simulated
         * preview" tag, so neither is repeated here: this card is the terms and
         * the step-up. The description says what the component would DO, not why
         * the request was blocked, which is the gate card's line to deliver.
         */}
        <code className={styles.mount}>{outcome.mount}</code>
        <p className={styles.simTitle}>{outcome.title}</p>
        <p className={styles.simDesc}>{outcome.description}</p>
        <SummaryList items={outcome.terms} />
        <div className={styles.simCollects}>
          <span className={styles.simCollectsLabel}>{copy.simulatedCollects}</span>
          <ul className={styles.simChips}>
            {outcome.collects.map((field) => (
              <li key={field} className={styles.simChip}>
                {field}
              </li>
            ))}
          </ul>
        </div>
        <span className={styles.caption}>{copy.simulatedCaption}</span>
      </div>
    </ChatBubble>
  );
}
