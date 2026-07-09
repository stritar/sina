"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sina-design-system/core";
import styles from "./Term.module.css";

/**
 * Inline jargon tooltip: wraps a term's first use on a page with a
 * dotted-underline trigger whose tooltip gives the plain-language definition,
 * so non-technical readers never have to round-trip to the glossary. Keyboard
 * accessible (Radix tooltip on a real button). Definitions mirror
 * /docs/reference/glossary — update both together.
 */
const DEFINITIONS: Record<string, string> = {
  intent:
    "The AI's request in plain data — “show a transfer form for $60,000” — never actual UI code.",
  constitution:
    "Your rulebook, written as code the server can run — limits, approvals, required components.",
  escalation:
    "When a request breaks a rule, SINA swaps in a stricter component (like an approval dialog) instead of what was asked for.",
  interception:
    "The server-side checkpoint every AI request passes through before anything renders.",
  primitive:
    "A plain building-block component — button, dialog, form field — accessible out of the box, with no domain rules attached.",
  "governed component":
    "A component the rules can force onto the screen — e.g. a secure approval dialog for a large transfer.",
  "display pattern":
    "A read-only arrangement of primitives (a balance card, a transaction list) that renders when a request passes cleanly.",
  "audit event":
    "The record SINA writes for every decision: what was asked, what rule fired, what rendered.",
};

export function Term({ term, children }: { term: string; children?: ReactNode }) {
  const definition = DEFINITIONS[term];
  // Unknown key: render the text unwrapped rather than an empty tooltip.
  if (!definition) return <>{children ?? term}</>;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={styles.term}>
            {children ?? term}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className={styles.content}>
          {definition}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
