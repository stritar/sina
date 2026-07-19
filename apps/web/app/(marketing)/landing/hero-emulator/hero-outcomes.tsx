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
 *  - `simulated-dialog` → a non-interactive card NAMING the governed component
 *    SINA would mount for a non-fintech escalation (openly a simulation; no
 *    such component exists yet, so no fake buttons — the honest, axe-clean choice).
 */
type HeroOutcome =
  | { kind: "summary"; items: SummaryItem[] }
  | { kind: "secure-wire-dialog" }
  | { kind: "simulated-dialog"; mount: string; caption: string };

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
    kind: "simulated-dialog",
    mount: "CoSignDialog",
    caption: "A pharmacist co-signs here. Simulated preview.",
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
    kind: "simulated-dialog",
    mount: "DualAuthDialog",
    caption: "A second officer approves here. Simulated preview.",
  },
};

/** The gate's decision for a turn, inline in the thread (the machine lane). */
export function TurnGate({ trace }: { trace: EmulatorTrace }) {
  const meta = `${trace.latencyMs} ms · simulated`;
  if (trace.verdict === "escalate") {
    return (
      <GateCard
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
      size="sm"
      kicker={copy.gateKicker}
      status="pass"
      mount={trace.mount ?? undefined}
      violations={trace.violations}
      meta={meta}
    />
  );
}

/** What the user sees once the gate decided: the confirm card, or the dialog. */
export function TurnOutcome({
  scenario,
  trace,
}: {
  scenario: EmulatorScenario;
  trace: EmulatorTrace;
}) {
  const outcome = HERO_OUTCOME[scenario.id];
  if (!outcome) return null;

  if (outcome.kind === "summary") {
    return (
      <ChatBubble variant="outcome" size="sm" kicker={copy.rendersKicker}>
        <SummaryList items={outcome.items} />
      </ChatBubble>
    );
  }

  if (outcome.kind === "secure-wire-dialog") {
    return (
      <ChatBubble variant="outcome" size="sm" kicker={copy.rendersKicker}>
        <div className={styles.dialogRow}>
          <SecureWireDialog
            intent={OVER_LIMIT_WIRE_INTENT}
            violations={trace.violations as Violation[]}
            onSubmitApproval={async () => ({ approved: true, violations: [] })}
            triggerLabel="Review and approve"
          />
          <span className={styles.caption}>{copy.wireApproval}</span>
        </div>
      </ChatBubble>
    );
  }

  return (
    <ChatBubble variant="outcome" size="sm" kicker={copy.rendersKicker}>
      <div className={styles.simulatedDialog}>
        <code className={styles.mount}>{outcome.mount}</code>
        <span className={styles.caption}>{outcome.caption}</span>
      </div>
    </ChatBubble>
  );
}
