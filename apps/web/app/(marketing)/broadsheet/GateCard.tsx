import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { Badge, type BadgeColor } from "./Badge";
import type { ButtonSize } from "./ButtonSecondary";
import styles from "./GateCard.module.css";

export type GateStatus = "checking" | "pass" | "escalate" | "reject";

export interface GateViolation {
  /** Machine code (e.g. "AMOUNT_REQUIRES_APPROVAL") — the badge label. */
  code: string;
  severity: "reject" | "escalate" | "flag";
  message: string;
  /** Cited standard, when the rule cites one. */
  standard?: string;
}

type GateCardBase = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  size?: ButtonSize;
  /** Small lane label (e.g. "The gate"). */
  kicker?: string;
  /** The component the decision mounts or forces (shown as `mount: <name>`). */
  mount?: string;
  /** Trailing meta line (e.g. "12 ms · simulated"). */
  meta?: string;
  violations?: readonly GateViolation[];
};

/**
 * `statusIcon` is optional while checking or on a pass, but REQUIRED for the
 * escalate/reject statuses: an error or warning state must carry its bold
 * status glyph (callers pass `<Warning weight="bold" />` for escalate and
 * `<WarningOctagon weight="bold" />` for reject; icons always come from the
 * caller, never bundled here).
 */
export type GateCardProps = GateCardBase &
  (
    | { status: "checking" | "pass"; statusIcon?: ReactNode }
    | { status: "escalate" | "reject"; statusIcon: ReactNode }
  );

const STATUS_LABEL: Record<Exclude<GateStatus, "checking">, string> = {
  pass: "Pass",
  escalate: "Escalated",
  reject: "Blocked",
};

const STATUS_COLOR: Record<Exclude<GateStatus, "checking">, BadgeColor> = {
  pass: "green",
  escalate: "amber",
  reject: "red",
};

const SEVERITY_COLOR: Record<GateViolation["severity"], BadgeColor> = {
  reject: "red",
  escalate: "amber",
  flag: "gray",
};

/**
 * Broadsheet gate card: the verdict lane of a chat exchange. While `checking`
 * it shows a pulsing busy line; once decided it leads with a solid verdict Badge
 * (green pass / amber escalated / red blocked), the mounted or forced component
 * in mono, the violations (a solid severity Badge stacked above each message and
 * cited standard, all siblings — never one status nested in another), and a
 * muted meta line. Dashed border: this is the machine lane, like TraceCard.
 *
 * The whole decision is a single column: every badge sits ABOVE the text it
 * labels, never beside it, so a long machine code never squeezes its message.
 * Every badge is `solid` — the gate speaks in filled chips, not tints.
 */
export function GateCard({
  status,
  statusIcon,
  size = "md",
  kicker,
  mount,
  meta,
  violations,
  className,
  ...rest
}: GateCardProps) {
  return (
    <div
      {...rest}
      data-broadsheet=""
      data-status={status}
      data-size={size}
      className={cn(styles.root, className)}
    >
      {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
      {status === "checking" ? (
        <p className={styles.busy}>Checking against the constitution&hellip;</p>
      ) : (
        <div className={styles.decision}>
          <div className={styles.verdict}>
            <Badge color={STATUS_COLOR[status]} variant="solid" size={size} icon={statusIcon}>
              {STATUS_LABEL[status]}
            </Badge>
            {mount ? <code className={styles.mount}>mount: {mount}</code> : null}
          </div>
          {violations && violations.length > 0 ? (
            <ul className={styles.violations}>
              {violations.map((violation) => (
                <li key={violation.code} className={styles.violation}>
                  <Badge color={SEVERITY_COLOR[violation.severity]} variant="solid" size="sm">
                    {violation.code}
                  </Badge>
                  <span className={styles.message}>
                    {violation.message}
                    {violation.standard ? (
                      <cite className={styles.standard}>{violation.standard}</cite>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {meta ? <p className={styles.meta}>{meta}</p> : null}
        </div>
      )}
    </div>
  );
}
