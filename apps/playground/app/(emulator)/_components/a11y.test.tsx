// @vitest-environment jsdom

/**
 * Dogfood the a11y bar on the emulator's rendered surface — the same automated
 * axe gate every `core` primitive must pass. We render the presentational pieces
 * with real gate data (no live model, no browser-only shell effects) and assert
 * zero violations.
 */

// Chart.js display components (BalanceTrend, SpendingBreakdown, …) mount a
// <canvas>; jsdom has no 2D context, so mock it before anything renders.
import "vitest-canvas-mock";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import { runGate, runExperience } from "@sina-design-system/governance-demo";
import { getScenario } from "@sina-design-system/governance-demo";
import { ChatThread } from "./ChatThread";
import { Composer } from "./Composer";
import { ConsoleTimeline } from "@sina-design-system/governance-demo";
import { AuditLedger } from "@sina-design-system/governance-demo";
import { GateTransportProvider } from "@sina-design-system/governance-demo";
import type { ConsoleView, GateTransport, Turn } from "@sina-design-system/governance-demo";

expect.extend(toHaveNoViolations);

/**
 * The governed hosts re-gate through the transport, so rendering an escalated trace
 * needs one in context — `useGateTransport()` throws otherwise, by design (a demo must
 * never quietly fall back to gating in the browser). Nothing here submits an approval,
 * so a never-resolving stub is enough.
 */
const stubTransport: GateTransport = {
  runScenario: () => new Promise<ConsoleView>(() => {}),
  regateWire: () => new Promise<ConsoleView>(() => {}),
  regateAction: () => new Promise<ConsoleView>(() => {}),
};

// jsdom lacks these; Radix/components probe for them defensively.
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

const blockedTrace = runGate(getScenario("over-limit")!.envelope);
const governedTrace = runGate(getScenario("five-thousand")!.envelope);
const readTrace = runGate(getScenario("list-transactions")!.envelope);
const experienceTraces = runExperience(getScenario("dashboard")!.envelopes!);

const turns: Turn[] = [
  { id: "1", prompt: "Wire $5,000 to Beta LLC", view: { kind: "gate", trace: governedTrace } },
  { id: "2", prompt: "Wire $60,000 to Beta LLC", view: { kind: "gate", trace: blockedTrace } },
  {
    id: "3",
    prompt: "Show my last 2 transactions",
    view: { kind: "gate", trace: readTrace },
  },
  {
    id: "4",
    prompt: "Give me an overview of my finances",
    view: { kind: "experience", traces: experienceTraces },
  },
  {
    id: "5",
    prompt: "raw payload",
    view: { kind: "transport", error: { reason: "malformed", message: "not valid JSON" } },
  },
];

describe("emulator a11y", () => {
  it("console (blocked) has no axe violations", async () => {
    const { container } = render(<ConsoleTimeline view={{ kind: "gate", trace: blockedTrace }} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("console (governed) has no axe violations", async () => {
    const { container } = render(<ConsoleTimeline view={{ kind: "gate", trace: governedTrace }} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("chat thread + audit ledger have no axe violations", async () => {
    const { container } = render(
      <GateTransportProvider transport={stubTransport}>
        <ChatThread turns={turns} />
        <AuditLedger events={[blockedTrace.audit!, governedTrace.audit!]} />
      </GateTransportProvider>,
    );

    // The registry mounts every component through React.lazy, so a bare render would
    // axe the (empty) Suspense fallbacks and pass without ever seeing the real markup.
    // Wait for both lazy branches — the forced governed dialog and a presentational
    // read — to actually resolve first. On a cold CI runner the dynamic import() of the
    // fintech-react → core chunk chain can exceed the default 1000ms wait, so give these
    // lazy branches room to resolve (a genuine failure to mount still throws).
    await screen.findByRole("button", { name: /Review wire transfer/i }, { timeout: 5000 });
    await screen.findAllByText(/Everyday Checking/i, undefined, { timeout: 5000 });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("composer has no axe violations", async () => {
    const { container } = render(
      <Composer value="" onChange={() => {}} onSend={() => {}} onPickScenario={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
