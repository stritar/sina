/**
 * The panel's two visitor-facing timing surfaces: the dwell countdown, and the
 * confirm-then-restart sequence a completed approval triggers.
 *
 * The dwell countdown: the bar that tells a visitor when the NEXT scenario
 * arrives. It must be mounted only while the dwell timer is actually counting,
 * because a pause tears that timer down and re-schedules the full duration on
 * resume — a bar that merely froze would drift by up to TIMINGS.dwell.
 *
 * Reduced motion is OFF here (landing.test.tsx keeps it ON and covers the
 * static thread, which never dwells).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { heroEmulator as copy } from "../copy";
import { IndustryProvider } from "../IndustryContext";
import { DEFENSE_SCENARIOS, HEALTHCARE_SCENARIOS, cannedTrace } from "../emulator/simulated";
import type { SimulatedScenario } from "../emulator/types";
import { HeroEmulator } from "./HeroEmulator";
import { TurnOutcome } from "./hero-outcomes";
import { TIMINGS } from "./useConversation";

function stubMatchMedia() {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  stubMatchMedia();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("HeroEmulator industry tag", () => {
  // The glyph is the same mark the hero's segment selector uses, so it has to
  // actually render — a missing icon leaves a chip that no longer matches the
  // control that set it. It must also stay decorative: the label beside it
  // already says "Fintech", and a labelled glyph would announce it twice.
  it("carries the industry glyph, and the glyph is not announced", () => {
    const { container } = render(
      <IndustryProvider>
        <HeroEmulator />
      </IndustryProvider>,
    );

    const tag = container.querySelector(".industryTag");
    expect(tag).not.toBeNull();
    expect(tag?.querySelector("svg")).not.toBeNull();
    expect(tag?.textContent).toBe("Fintech");
  });
});

describe("HeroEmulator dwell countdown", () => {
  it("runs only during the dwell, and restarts rather than freezing on pause", async () => {
    const { container } = render(
      <IndustryProvider>
        <HeroEmulator />
      </IndustryProvider>,
    );
    const bar = () => container.querySelector(".countdown");

    // The seeded pre-play frame rests on phase "dwell" but isn't counting down
    // to anything: the loop hasn't started.
    expect(bar()).toBeNull();

    await advance(TIMINGS.start);
    expect(bar()).toBeNull(); // typing

    // Step to the first verdict's dwell.
    for (let elapsed = 0; elapsed < 60_000 && !bar(); elapsed += 100) {
      await advance(100);
    }
    const running = bar();
    expect(running).not.toBeNull();
    // Duration is TIMINGS.dwell, not a hard-coded copy of it.
    expect(running?.getAttribute("style")).toContain(`${TIMINGS.dwell}ms`);
    // Decorative: the thread already carries the meaning.
    expect(running?.getAttribute("aria-hidden")).toBe("true");

    // Hover pauses the loop; the bar unmounts so a resume restarts it from zero
    // alongside the re-scheduled timer.
    const panel = container.querySelector("section");
    fireEvent.pointerEnter(panel!);
    expect(bar()).toBeNull();
    await advance(30_000);
    expect(bar()).toBeNull();

    fireEvent.pointerLeave(panel!);
    expect(bar()).not.toBeNull();
    expect(bar()).not.toBe(running);
  });
});

describe("HeroEmulator thread surface", () => {
  it("strips the thread's own panel so the simulator reads as one flat card", () => {
    const { container } = render(
      <IndustryProvider>
        <HeroEmulator />
      </IndustryProvider>,
    );

    // The hero frame has no inset thread surface (Figma 196:819): the override
    // must actually reach ChatThread, which composes cn(styles.root, className).
    const thread = container.querySelector('[role="region"]');
    expect(thread).not.toBeNull();
    expect(thread?.className).toContain("thread");
    expect(thread?.className).toContain("root");
  });

  it("mounts the composer as one field with a single real control", () => {
    const { container } = render(
      <IndustryProvider>
        <HeroEmulator />
      </IndustryProvider>,
    );

    // The composer root is the field itself: it carries the class the hero
    // styles it through, the data-composer hook, and the data-broadsheet marker
    // that earns the global focus outline. Everything inside it is decorative
    // except the send button, which stays the only focusable element.
    const composer = container.querySelector('[class*="composer"]');
    expect(composer).not.toBeNull();
    expect(composer?.hasAttribute("data-composer")).toBe(true);
    expect(composer?.hasAttribute("data-broadsheet")).toBe(true);
    expect(composer?.querySelectorAll("button")).toHaveLength(1);
  });
});

/**
 * The non-fintech escalations. No constitution exists for these industries, so
 * the outcome is a described component rather than a mounted one: it must show
 * enough anatomy to be worth reading, and must never grow a control that
 * pretends to collect the step-up it describes.
 */
describe("HeroEmulator simulated mount preview", () => {
  const CASES: Array<{
    industry: string;
    scenario: SimulatedScenario;
    title: string;
    emphasised: string;
  }> = [
    {
      industry: "healthcare",
      scenario: HEALTHCARE_SCENARIOS.find((s) => s.id === "high-dose-order")!,
      title: "Pharmacist co-signature required",
      emphasised: "12 mg",
    },
    {
      industry: "defense",
      scenario: DEFENSE_SCENARIOS.find((s) => s.id === "munitions-transfer")!,
      title: "Second officer approval required",
      emphasised: "40 cases",
    },
  ];

  for (const { industry, scenario, title, emphasised } of CASES) {
    it(`shows the ${industry} component's terms and step-up, with no fake controls`, () => {
      const { container } = render(
        <TurnOutcome scenario={scenario} trace={cannedTrace(scenario, scenario.result)} />,
      );

      // The anatomy a visitor came for: what the component would bind...
      expect(screen.queryByText(title)).not.toBeNull();
      expect(screen.queryByText(emphasised)).not.toBeNull();
      // ...and what its step-up would gather, described rather than simulated.
      expect(screen.queryByText(copy.simulatedCollects)).not.toBeNull();
      // Framed as hypothetical, so the card never reads as a mounted component.
      expect(screen.queryByText(copy.simulatedCaption)).not.toBeNull();

      // The honesty guard. A disabled control that collects nothing is the same
      // lie as a fake button, so neither may appear here.
      expect(container.querySelectorAll("button")).toHaveLength(0);
      expect(container.querySelectorAll("input")).toHaveLength(0);
    });

    it(`names the same component the ${industry} gate said it would mount`, () => {
      // Two sources state the component name: the canned trace (which the gate
      // card renders) and the outcome card. They must never drift apart.
      render(<TurnOutcome scenario={scenario} trace={cannedTrace(scenario, scenario.result)} />);
      expect(screen.queryByText(scenario.result.mount!)).not.toBeNull();
    });

    it(`reads top to bottom and passes axe for ${industry}`, async () => {
      // axe schedules its own work; the suite-wide fake timers would stall it.
      vi.useRealTimers();
      const { container } = render(
        <TurnOutcome scenario={scenario} trace={cannedTrace(scenario, scenario.result)} />,
      );

      // Component name, then title, then description, then the bound terms,
      // then the step-up, then the honest close. The terms carry the meaning,
      // so they must not sink below the step-up that merely describes a form.
      const card = container.querySelector('[class*="simCard"]')!;
      const order = [...card.children].map((el) => el.tagName.toLowerCase());
      expect(order).toEqual(["code", "p", "p", "dl", "div", "span"]);

      // The landing axe pass only covers the fintech frame, so this path needs
      // its own: it introduces a list and a definition list of its own.
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});

describe("HeroEmulator visitor-driven approval", () => {
  it("answers a completed approval with a confirmation reply, then counts down and restarts", async () => {
    const { container } = render(
      <IndustryProvider>
        <HeroEmulator />
      </IndustryProvider>,
    );

    await advance(TIMINGS.start);
    // Step to the escalated turn, where the REAL SecureWireDialog is mounted.
    const trigger = () => screen.queryByRole("button", { name: /Review and approve/ });
    for (let elapsed = 0; elapsed < 60_000 && !trigger(); elapsed += 100) {
      await advance(100);
    }
    expect(trigger()).not.toBeNull();

    // Drive the dialog exactly as a visitor would: review, approver, OTP.
    await act(async () => {
      fireEvent.click(trigger()!);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Request approval" }));
    });
    fireEvent.change(screen.getByLabelText(/Approver ID/), { target: { value: "mgr-42" } });
    fireEvent.change(screen.getByLabelText(/Approver name/), { target: { value: "Dana Reyes" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send for approval" }));
    });
    const boxes = screen.getAllByRole("textbox");
    for (const [i, box] of boxes.entries()) {
      fireEvent.change(box, { target: { value: String(i + 1) } });
    }
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    });

    // The thread answers. The dialog's own success Alert is separate: this is
    // the conversation replying, so the reply is plain text (no nested status).
    expect(screen.queryByText(copy.wireApproved)).not.toBeNull();

    // A reading beat, then the restart pause counts itself down.
    const bar = () => container.querySelector(".countdown");
    expect(bar()).toBeNull();
    await advance(TIMINGS.approved);
    expect(bar()?.getAttribute("style")).toContain(`${TIMINGS.restart}ms`);

    // ...and the story begins again from the first scenario, thread intact.
    await advance(TIMINGS.restart);
    expect(bar()).toBeNull();
    expect(screen.queryByText(copy.wireApproved)).not.toBeNull();
  });
});
