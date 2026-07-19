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
import { heroEmulator as copy } from "../copy";
import { IndustryProvider } from "../IndustryContext";
import { HeroEmulator } from "./HeroEmulator";
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

describe("HeroEmulator dwell countdown", () => {
  it("runs only during the dwell, and restarts rather than freezing on pause", async () => {
    const { container } = render(
      <IndustryProvider>
        <HeroEmulator />
      </IndustryProvider>,
    );
    const bar = () => container.querySelector(".countdown");

    // The empty pre-play frame rests on phase "dwell" but isn't counting down
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
