"use client";

/**
 * ComparisonToggle — the money shot. Toggles between what SINA mounted (governed)
 * and what an ungoverned chat app WOULD have mounted from the same raw intent: a
 * naive confirm button, no gate. Dramatizes "the model emits intent; SINA decides
 * what renders."
 */

import { useState, type ReactNode } from "react";
import { Button } from "@sina-design-system/core";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import { formatAmount } from "../_lib/format";

function UngovernedConfirm({ payload }: { payload: unknown }) {
  const wire = (payload ?? {}) as Record<string, unknown>;
  const amount = typeof wire.amount === "number" ? wire.amount : 0;
  const currency = typeof wire.currency === "string" ? wire.currency : "USD";
  const creditor =
    wire.creditor && typeof wire.creditor === "object"
      ? ((wire.creditor as Record<string, unknown>).name as string)
      : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-danger/40 bg-danger-bg p-3">
      <div className="flex items-center gap-1.5">
        <Warning className="size-control-2xs text-danger" aria-hidden />
        <span className="font-mono text-xs text-danger">ungoverned · no gate ran</span>
      </div>
      <p className="text-ui text-text">
        Wire <span className="font-medium">{formatAmount(amount, currency)}</span>
        {creditor ? ` to ${creditor}` : ""}?
      </p>
      <div className="flex justify-end">
        {/* The raw, hallucination-trusting button a normal app would have mounted. */}
        <Button variant="danger" size="sm">
          Confirm transfer
        </Button>
      </div>
    </div>
  );
}

const TRACK = "inline-flex rounded-md bg-surface-sunken p-0.5";
const TAB = "rounded-sm px-2 py-0.5 font-mono text-xs transition-colors duration-fast ease-standard";

export function ComparisonToggle({
  payload,
  governed,
}: {
  payload: unknown;
  governed: ReactNode;
}) {
  const [view, setView] = useState<"sina" | "ungoverned">("sina");

  return (
    <div className="flex flex-col gap-2">
      <div className={TRACK} role="group" aria-label="Compare governed vs ungoverned">
        <button
          type="button"
          onClick={() => setView("sina")}
          aria-pressed={view === "sina"}
          className={`${TAB} ${view === "sina" ? "bg-surface text-text shadow-xs" : "text-text-muted"}`}
        >
          SINA (governed)
        </button>
        <button
          type="button"
          onClick={() => setView("ungoverned")}
          aria-pressed={view === "ungoverned"}
          className={`${TAB} ${
            view === "ungoverned" ? "bg-surface text-danger shadow-xs" : "text-text-muted"
          }`}
        >
          Ungoverned
        </button>
      </div>
      {view === "sina" ? governed : <UngovernedConfirm payload={payload} />}
    </div>
  );
}
