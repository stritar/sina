"use client";

/**
 * AuditLedger — the running compliance ledger: one row per decision this session
 * (the real emitted, redacted AuditEvents), with copy/export-JSON. Previews the
 * Phase-8 audit sink; the contract is unchanged.
 */

import { useState } from "react";
import { Button } from "@sina-design-system/core";
import { CaretDown, CaretRight, Check, Copy as CopyIcon } from "@phosphor-icons/react/dist/ssr";
import type { AuditEvent } from "@sina-design-system/governance";
import { pretty } from "../_lib/format";
import { CodeBlock } from "./CodeBlock";
import styles from "./AuditLedger.module.css";

function LedgerRow({ event }: { event: AuditEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.row}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={styles.rowButton}
      >
        {open ? (
          <CaretDown className={styles.caret} aria-hidden />
        ) : (
          <CaretRight className={styles.caret} aria-hidden />
        )}
        <span className={styles.decisionId}>{event.decisionId}</span>
        <span className={styles.decidedComponent}>
          {event.decidedComponent ?? (event.result.valid ? "mounted" : "rejected")}
        </span>
      </button>
      {open && (
        <div className={styles.rowDetail}>
          <CodeBlock title="AuditEvent" code={pretty(event)} maxLines={12} />
        </div>
      )}
    </div>
  );
}

export function AuditLedger({ events }: { events: AuditEvent[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={styles.headerToggle}
        >
          {open ? (
            <CaretDown className={styles.caret} aria-hidden />
          ) : (
            <CaretRight className={styles.caret} aria-hidden />
          )}
          <span className={styles.title}>Audit ledger</span>
          <span className={styles.count}>({events.length})</span>
        </button>
        {events.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            iconLeft={
              copied ? <Check className={styles.exportIcon} /> : <CopyIcon className={styles.exportIcon} />
            }
            onClick={() => {
              void navigator.clipboard?.writeText(pretty(events));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            <span className={styles.exportLabel}>{copied ? "Copied" : "Export JSON"}</span>
          </Button>
        )}
      </div>
      {open &&
        (events.length > 0 ? (
          <div className={styles.list}>
            {events.map((event, i) => (
              <LedgerRow key={`${event.decisionId}-${i}`} event={event} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            No decisions yet — run a scenario.
          </p>
        ))}
    </div>
  );
}
