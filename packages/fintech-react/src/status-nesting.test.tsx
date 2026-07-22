/**
 * @sina-design-system/fintech-react — status-nesting guard
 *
 * Enforces the CLAUDE.md rule "Never nest status elements inside one another":
 * a status element (Alert / Toast / Badge) must never be rendered INSIDE another
 * status element — they compose as siblings (a text-only Alert with any Badges in
 * a sibling row beneath it, the BlockedState pattern). Each core status root
 * carries a `data-sina-status` marker; this guard renders every fintech-react
 * status surface and fails if any `[data-sina-status]` element contains another.
 * When you ship a new status surface, add a case here.
 *
 * Recipe: /no-nested-status. The reference implementation is BlockedState.tsx
 * (apps/playground) — a text-only Alert with the severity Badges as siblings.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GovernedActionDialog } from "./GovernedActionDialog/GovernedActionDialog.js";
import { SecureWireDialog } from "./SecureWireDialog/SecureWireDialog.js";
import { MandatoryDisclosure } from "./MandatoryDisclosure/MandatoryDisclosure.js";
import { InsightCard } from "./InsightCard/InsightCard.js";

// jsdom lacks these; Radix Dialog probes for them defensively.
if (!window.matchMedia) {
  // @ts-expect-error test shim
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
}
if (!("ResizeObserver" in window)) {
  // @ts-expect-error test shim
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(cleanup);

// An escalating violation so every governed dialog reaches its "why this is
// blocked" review state and renders the severity Badge — the exact spot the bug
// lived (Badge inside the warning Alert).
const escalate = [
  {
    code: "ACTION_REQUIRES_APPROVAL",
    message: "this action requires authorization before it can proceed",
    severity: "escalate" as const,
  },
];

const wireIntent = {
  amount: 6_000_000,
  currency: "USD",
  debtor: { name: "Acme Corp", account: { scheme: "sepa" } },
  creditor: { name: "Beta LLC", account: { scheme: "sepa" } },
};

const noop = () => vi.fn().mockResolvedValue({ approved: true, violations: [] });

// Each case renders a real status surface, opening any dialog to its review
// phase. The invariant: no `[data-sina-status]` element contains another.
const CASES: Array<{ name: string; mount: () => Promise<void> }> = [
  {
    name: "GovernedActionDialog (review, escalated)",
    mount: async () => {
      render(
        <GovernedActionDialog
          intent={{ amount: 40_000, currency: "USD", rail: "ach" }}
          violations={escalate}
          onSubmitApproval={noop()}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /review & authorize/i }));
    },
  },
  {
    name: "SecureWireDialog (review, escalated)",
    mount: async () => {
      render(
        <SecureWireDialog intent={wireIntent} violations={escalate} onSubmitApproval={noop()} />,
      );
      await userEvent.click(screen.getByRole("button", { name: /review wire transfer/i }));
    },
  },
  {
    name: "MandatoryDisclosure (review, escalated)",
    mount: async () => {
      render(
        <MandatoryDisclosure
          intent={{ title: "Reg E disclosure", body: ["You have the right to…"], version: "1.0" }}
          violations={escalate}
          onSubmitApproval={noop()}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /review disclosure/i }));
    },
  },
  {
    name: "InsightCard (with metric)",
    mount: async () => {
      render(
        <InsightCard
          payload={{
            tone: "caution",
            title: "Spending up",
            body: "You spent more this month.",
            metricLabel: "vs. last month",
            metricValue: "+18%",
          }}
        />,
      );
    },
  },
];

describe("status elements are never nested inside one another", () => {
  it.each(CASES)("$name keeps status elements as siblings", async ({ mount }) => {
    await mount();

    // Dialogs portal their content into document.body, so query the whole document.
    const markers = document.body.querySelectorAll("[data-sina-status]");
    // Sanity: the core `data-sina-status` marker must be present, or this guard
    // would pass vacuously if the marker were ever removed from Alert/Badge/Toast.
    expect(markers.length, "expected at least one [data-sina-status] element").toBeGreaterThan(0);

    const nested = document.body.querySelector("[data-sina-status] [data-sina-status]");
    expect(
      nested,
      "a status element (Alert/Toast/Badge) is nested inside another — compose them as siblings instead",
    ).toBeNull();
  });
});
