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

function LedgerRow({ event }: { event: AuditEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
      >
        {open ? (
          <CaretDown className="size-control-2xs text-text-muted" aria-hidden />
        ) : (
          <CaretRight className="size-control-2xs text-text-muted" aria-hidden />
        )}
        <span className="font-mono text-xs text-text-muted">{event.decisionId}</span>
        <span className="ml-auto font-mono text-xs text-text-subtle">
          {event.decidedComponent ?? (event.result.valid ? "mounted" : "rejected")}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3">
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
    <div className="rounded-lg border border-border-subtle bg-surface">
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
        >
          {open ? (
            <CaretDown className="size-control-2xs text-text-muted" aria-hidden />
          ) : (
            <CaretRight className="size-control-2xs text-text-muted" aria-hidden />
          )}
          <span className="text-ui font-medium text-text">Audit ledger</span>
          <span className="font-mono text-xs text-text-subtle">({events.length})</span>
        </button>
        {events.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            iconLeft={
              copied ? <Check className="size-control-2xs" /> : <CopyIcon className="size-control-2xs" />
            }
            onClick={() => {
              void navigator.clipboard?.writeText(pretty(events));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            <span className="font-mono text-xs">{copied ? "Copied" : "Export JSON"}</span>
          </Button>
        )}
      </div>
      {open &&
        (events.length > 0 ? (
          <div className="border-t border-border-subtle">
            {events.map((event, i) => (
              <LedgerRow key={`${event.decisionId}-${i}`} event={event} />
            ))}
          </div>
        ) : (
          <p className="border-t border-border-subtle px-3 py-3 text-ui text-text-subtle">
            No decisions yet — run a scenario.
          </p>
        ))}
    </div>
  );
}
