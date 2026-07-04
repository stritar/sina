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
import styles from "./ComparisonToggle.module.css";

function UngovernedConfirm({ payload }: { payload: unknown }) {
  const wire = (payload ?? {}) as Record<string, unknown>;
  const amount = typeof wire.amount === "number" ? wire.amount : 0;
  const currency = typeof wire.currency === "string" ? wire.currency : "USD";
  const creditor =
    wire.creditor && typeof wire.creditor === "object"
      ? ((wire.creditor as Record<string, unknown>).name as string)
      : undefined;

  return (
    <div className={styles.confirmRoot}>
      <div className={styles.confirmHeader}>
        <Warning className={styles.confirmIcon} aria-hidden />
        <span className={styles.confirmTag}>ungoverned · no gate ran</span>
      </div>
      <p className={styles.confirmText}>
        Wire <span className={styles.emphasis}>{formatAmount(amount, currency)}</span>
        {creditor ? ` to ${creditor}` : ""}?
      </p>
      <div className={styles.confirmActions}>
        {/* The raw, hallucination-trusting button a normal app would have mounted. */}
        <Button variant="danger" size="sm">
          Confirm transfer
        </Button>
      </div>
    </div>
  );
}

export function ComparisonToggle({
  payload,
  governed,
}: {
  payload: unknown;
  governed: ReactNode;
}) {
  const [view, setView] = useState<"sina" | "ungoverned">("sina");

  return (
    <div className={styles.root}>
      <div className={styles.track} role="group" aria-label="Compare governed vs ungoverned">
        <button
          type="button"
          onClick={() => setView("sina")}
          aria-pressed={view === "sina"}
          className={[styles.tab, view === "sina" ? styles.tabActiveSina : styles.tabInactive]
            .filter(Boolean)
            .join(" ")}
        >
          SINA (governed)
        </button>
        <button
          type="button"
          onClick={() => setView("ungoverned")}
          aria-pressed={view === "ungoverned"}
          className={[
            styles.tab,
            view === "ungoverned" ? styles.tabActiveUngoverned : styles.tabInactive,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Ungoverned
        </button>
      </div>
      {view === "sina" ? governed : <UngovernedConfirm payload={payload} />}
    </div>
  );
}
