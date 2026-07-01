"use client";

/**
 * TransportState — a model/transport failure (malformed output, refusal, rate
 * limit). Rendered in the WARNING register, deliberately distinct from a danger
 * governance block: a transport error must never read as a gate decision.
 */

import { Alert, Button } from "@sina-design-system/core";
import { ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import type { TransportError } from "../_lib/types";

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
    <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-3">
      <Alert variant="warning" title={TITLE[error.reason]}>
        {error.message}
      </Alert>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-text-subtle">
          transport · {error.reason} — the gate did not run
        </span>
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<ArrowsClockwise className="size-control-2xs" />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
