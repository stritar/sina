// @vitest-environment jsdom

/**
 * Dogfood the a11y bar on the emulator's rendered surface — the same automated
 * axe gate every `core` primitive must pass. We render the presentational pieces
 * with real gate data (no live model, no browser-only shell effects) and assert
 * zero violations.
 */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import { runGate, runExperience } from "../_lib/gate";
import { getScenario } from "../_lib/scenarios";
import { ChatThread } from "./ChatThread";
import { Composer } from "./Composer";
import { ConsoleTimeline } from "./ConsoleTimeline";
import { AuditLedger } from "./AuditLedger";
import type { Turn } from "../_lib/types";

expect.extend(toHaveNoViolations);

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
      <div>
        <ChatThread turns={turns} />
        <AuditLedger events={[blockedTrace.audit!, governedTrace.audit!]} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("composer has no axe violations", async () => {
    const { container } = render(
      <Composer value="" onChange={() => {}} onSend={() => {}} onPickScenario={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
