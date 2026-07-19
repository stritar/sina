/**
 * Timeline tests for the hero emulator's auto-play loop, driven with fake
 * timers and reduced motion OFF (the page-level landing.test.tsx keeps reduced
 * motion ON and covers the static frame + user-initiated runs end to end).
 * Timer transitions are scheduled from React effects, so each advance step
 * fires at most one transition; the `until` helper steps until a condition
 * holds instead of assuming exact offsets.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { IndustryProvider } from "../IndustryContext";
import { FINTECH_SCENARIOS } from "../emulator/fintech";
import { HeroEmulator } from "./HeroEmulator";
import { TIMINGS } from "./usePlayback";

const PASS_TRACE = {
  intent: "list_transactions",
  payload: {},
  result: { valid: true, violations: [], requiredComponent: null },
  mount: "TransactionList",
  audit: null,
  latencyMs: 2.2,
  schemaViolations: [],
  policyViolations: [],
};

function gateView(trace: Record<string, unknown>) {
  return { ok: true, json: async () => ({ kind: "gate", trace }) } as Response;
}

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

/** Step fake time until the condition holds (transitions chain via effects). */
async function until(predicate: () => boolean, maxMs = 90_000, step = 100) {
  for (let elapsed = 0; elapsed < maxMs && !predicate(); elapsed += step) {
    await advance(step);
  }
  expect(predicate()).toBe(true);
}

function composer(): Element {
  const node = document.querySelector("[data-composer]");
  if (!node) throw new Error("composer not rendered");
  return node;
}

function activeStoryStep(): string {
  return document.querySelector('[aria-hidden="true"] li[data-active]')?.textContent ?? "";
}

function renderEmulator() {
  return render(
    <IndustryProvider>
      <HeroEmulator />
    </IndustryProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  stubMatchMedia();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("hero emulator auto-play", () => {
  it("plays the full canned cycle and advances to the next scenario, never fetching", async () => {
    const fetchMock = vi.fn(() => {
      throw new Error("auto-play must never touch the network");
    });
    vi.stubGlobal("fetch", fetchMock);
    renderEmulator();

    // The pre-play static frame shows the completed default scenario.
    expect(screen.getByText("SecureWireDialog")).toBeDefined();

    // After the start hold the thread clears and the composer types.
    await advance(TIMINGS.start);
    expect(screen.queryByText("SecureWireDialog")).toBeNull();
    await until(() => (composer().textContent ?? "").startsWith("Wire $60,000"));
    expect(activeStoryStep()).toContain("Agent emits intent");

    // The prompt commits as a user bubble, then the intent card appears with
    // the human summary up front and the raw JSON behind a disclosure.
    const prompt = FINTECH_SCENARIOS[0]!.prompt;
    await until(() => screen.queryByText(prompt) !== null);
    await until(() => screen.queryByText("wire_transfer") !== null);
    expect(screen.getByText("Show the full intent JSON")).toBeDefined();

    // The canned verdict lands: escalation, forced component, simulated marker.
    await until(() => screen.queryByText("Escalated: approval required") !== null);
    expect(screen.getByText("SecureWireDialog")).toBeDefined();
    expect(screen.getByText(/\(simulated\)/)).toBeDefined();
    expect(activeStoryStep()).toContain("Verdict");

    // Dwell passes and the NEXT scenario starts typing on its own.
    const nextPrompt = FINTECH_SCENARIOS[1]!.prompt;
    await until(() => screen.queryByText(nextPrompt) !== null);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("the visible pause button freezes the timeline and play resumes it", async () => {
    renderEmulator();
    await advance(TIMINGS.start);
    await until(() => (composer().textContent ?? "").startsWith("Wire"));

    fireEvent.click(screen.getByRole("button", { name: "Pause the demo" }));
    const frozen = composer().textContent;
    await advance(30_000);
    expect(composer().textContent).toBe(frozen);

    fireEvent.click(screen.getByRole("button", { name: "Play the demo" }));
    await until(() => composer().textContent !== frozen);
  });

  it("hovering the panel pauses the loop; leaving resumes it", async () => {
    renderEmulator();
    await advance(TIMINGS.start);
    await until(() => (composer().textContent ?? "").startsWith("Wire"));

    const panel = screen.getByRole("region", { name: "Watch the gate decide" });
    fireEvent.pointerEnter(panel);
    const frozen = composer().textContent;
    await advance(30_000);
    expect(composer().textContent).toBe(frozen);

    fireEvent.pointerLeave(panel);
    await until(() => composer().textContent !== frozen);
  });

  it("a hidden tab pauses the loop", async () => {
    renderEmulator();
    await advance(TIMINGS.start);
    await until(() => (composer().textContent ?? "").startsWith("Wire"));

    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    fireEvent(document, new Event("visibilitychange"));
    const frozen = composer().textContent;
    await advance(30_000);
    expect(composer().textContent).toBe(frozen);

    visibility.mockReturnValue("visible");
    fireEvent(document, new Event("visibilitychange"));
    await until(() => composer().textContent !== frozen);
  });

  it("a chip click interrupts auto-play, runs the real gate, and stops the loop", async () => {
    const fetchMock = vi.fn().mockResolvedValue(gateView(PASS_TRACE));
    vi.stubGlobal("fetch", fetchMock);
    renderEmulator();
    await advance(TIMINGS.start);
    await until(() => (composer().textContent ?? "").startsWith("Wire"));

    fireEvent.click(screen.getByRole("button", { name: /show my last two transactions/i }));
    await until(() => screen.queryByText("Mounted") !== null);
    expect(screen.getByText("TransactionList")).toBeDefined();
    // A live trace, not a canned one: no simulated marker.
    expect(screen.queryByText(/\(simulated\)/)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // The loop stays stopped: dwell-length waits bring no new auto run.
    await advance(TIMINGS.dwell + 10_000);
    expect(screen.getByText("Mounted")).toBeDefined();
    expect(screen.getByRole("button", { name: "Replay this request" })).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
