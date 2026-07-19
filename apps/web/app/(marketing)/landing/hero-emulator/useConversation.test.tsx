/**
 * Timeline tests for the hero emulator's conversation engine, driven with fake
 * timers and reduced motion OFF (landing.test.tsx keeps reduced motion ON and
 * covers the static completed thread). The behavior under test: finished turns
 * COMMIT to an accumulating, capped history instead of the thread resetting per
 * scenario, so the chat stacks like a real messenger.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { heroPairFor } from "./scenarios";
import { HISTORY_CAP, TIMINGS, useConversation } from "./useConversation";

const PAIR = heroPairFor("fintech"); // [small (pass), over-limit (escalate)]
const FIRST_PROMPT = PAIR[0].prompt;
const SECOND_PROMPT = PAIR[1].prompt;

function Harness() {
  const { state, threadRef, togglePlay, fastForward, pauseHandlers } = useConversation(PAIR);
  return (
    <section aria-label="conversation harness" {...pauseHandlers}>
      <div ref={threadRef} />
      <output data-testid="history">
        {state.history.map((turn) => turn.scenario.id).join(",")}
      </output>
      <output data-testid="mode">{state.mode}</output>
      <output data-testid="phase">{state.phase}</output>
      <output data-testid="typed">
        {PAIR[state.scenarioIndex]?.prompt.slice(0, state.typedChars) ?? ""}
      </output>
      <button type="button" onClick={togglePlay}>
        toggle
      </button>
      <button type="button" onClick={fastForward}>
        send
      </button>
    </section>
  );
}

function history(): string {
  return screen.getByTestId("history").textContent ?? "";
}

function typed(): string {
  return screen.getByTestId("typed").textContent ?? "";
}

function phase(): string {
  return screen.getByTestId("phase").textContent ?? "";
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
async function until(predicate: () => boolean, maxMs = 120_000, step = 100) {
  for (let elapsed = 0; elapsed < maxMs && !predicate(); elapsed += step) {
    await advance(step);
  }
  expect(predicate()).toBe(true);
}

beforeEach(() => {
  vi.useFakeTimers();
  stubMatchMedia();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useConversation", () => {
  it("commits finished turns to history while the next prompt types, never fetching", async () => {
    const fetchMock = vi.fn(() => {
      throw new Error("the conversation loop must never touch the network");
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Harness />);

    // The pre-play static frame is the fully completed thread.
    expect(history()).toBe("small,over-limit");
    expect(screen.getByTestId("mode").textContent).toBe("static");

    // After the start hold the thread clears and the first prompt types.
    await advance(TIMINGS.start);
    expect(history()).toBe("");
    await until(() => typed().startsWith("Send $500"));
    expect(typed().length).toBeLessThan(FIRST_PROMPT.length);

    // The first turn commits WHILE the second prompt is already typing — the
    // accumulation a per-scenario reset would fail.
    await until(() => history() === "small");
    await until(() => typed().startsWith("Wire $60,000"));
    expect(history()).toBe("small");

    // The loop wraps and keeps appending instead of resetting.
    await until(() => history() === "small,over-limit,small");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("caps history at HISTORY_CAP across an endless loop", async () => {
    render(<Harness />);
    await advance(TIMINGS.start);

    await until(() => history().split(",").filter(Boolean).length === HISTORY_CAP, 240_000);

    // One more full cycle commits again; the cap holds and the oldest drops.
    const before = history();
    await until(() => history() !== before, 120_000);
    expect(history().split(",").filter(Boolean).length).toBe(HISTORY_CAP);
  });

  it("hover pauses the loop and leaving resumes it; the send button fast-forwards typing", async () => {
    render(<Harness />);
    await advance(TIMINGS.start);
    await until(() => typed().length > 0);

    const stage = screen.getByRole("region", { name: "conversation harness" });
    fireEvent.pointerEnter(stage);
    const frozen = typed();
    await advance(30_000);
    expect(typed()).toBe(frozen);

    fireEvent.pointerLeave(stage);
    await until(() => typed() !== frozen);

    // Fast-forward: mid-typing, the in-flight prompt lands in full at once.
    await until(() => phase() === "typing" && typed().length > 0);
    fireEvent.click(screen.getByRole("button", { name: "send" }));
    expect([FIRST_PROMPT, SECOND_PROMPT]).toContain(typed());
  });

  it("the toggle freezes the frame and restarts it", async () => {
    render(<Harness />);
    await advance(TIMINGS.start);
    await until(() => typed().length > 0);

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    const frozen = typed();
    await advance(30_000);
    expect(typed()).toBe(frozen);

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    await until(() => typed() !== frozen);
  });
});
