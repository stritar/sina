import type { ReactNode } from "react";
import { Callout } from "./Callout";

/**
 * Reusable content partials — boilerplate that recurs across many pages, authored
 * once and imported so the exact text never gets copy-pasted (the keep-it-lean
 * rule). Built on `<Callout>` so they inherit the lean callout styling.
 */

/** The compliance disclaimer required on every governance page + the fintech reference. */
export function ComplianceNote() {
  return (
    <Callout variant="note" title="Not legal advice">
      SINA encodes these standards as an engineering demonstration and an adoption
      aid — <strong>not legal advice</strong>. The thresholds map to real
      regulations, but you must validate any deployment against your own
      compliance and legal requirements.
    </Callout>
  );
}

/** The four-part accessibility promise every `core` primitive meets. */
export function A11yBar() {
  return (
    <Callout variant="governance" title="The accessibility bar">
      Every SINA primitive meets the same four-part bar: a <strong>focus trap</strong>{" "}
      where one applies, <strong>correct ARIA</strong>, <strong>full keyboard
      operability</strong>, and an <strong>automated axe pass</strong> in CI. It is
      not optional — a primitive that fails any of the four does not ship.
    </Callout>
  );
}

/** Prerequisites box for the Quickstart / guides. Pass the list as children. */
export function Prereqs({ children }: { children: ReactNode }) {
  return (
    <Callout variant="note" title="Before you start">
      {children}
    </Callout>
  );
}
