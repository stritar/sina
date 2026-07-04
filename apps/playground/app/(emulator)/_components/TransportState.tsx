"use client";

/**
 * TransportState — a model/transport failure (malformed output, refusal, rate
 * limit). Rendered in the WARNING register, deliberately distinct from a danger
 * governance block: a transport error must never read as a gate decision.
 */

import { Alert, Button } from "@sina-design-system/core";
import { ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import type { TransportError } from "../_lib/types";
import styles from "./TransportState.module.css";

const TITLE: Record<TransportError["reason"], string> = {
  malformed: "Model output was malformed",
  refusal: "Live model refused the request",
  "rate-limit": "Rate limited",
  error: "Transport error",
};

export function TransportState({
  error,
  onRetry,
}: {
  error: TransportError;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.root}>
      <Alert variant="warning" title={TITLE[error.reason]}>
        {error.message}
      </Alert>
      <div className={styles.footer}>
        <span className={styles.meta}>
          transport · {error.reason} — the gate did not run
        </span>
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<ArrowsClockwise className={styles.icon} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
