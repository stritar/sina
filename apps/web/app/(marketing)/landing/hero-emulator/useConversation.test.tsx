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
  const { state, threadRef, togglePlay, fastForward, approve, pauseHandlers } =
    useConversation(PAIR);
  return (
    <section aria-label="conversation harness" {...pauseHandlers}>
      <div ref={threadRef} data-testid="thread" />
      <output data-testid="history">
        {state.history.map((turn) => `${turn.scenario.id}${turn.approved ? "*" : ""}`).join(",")}
      </output>
      <output data-testid="mode">{state.mode}</output>
      <output data-testid="phase">{state.phase}</output>
      <output data-testid="index">{String(state.scenarioIndex)}</output>
      <output data-testid="typed">
        {PAIR[state.scenarioIndex]?.prompt.slice(0, state.typedChars) ?? ""}
      </output>
      <button type="button" onClick={togglePlay}>
        toggle
      </button>
      <button type="button" onClick={fastForward}>
        send
      </button>
      <button type="button" onClick={() => approve({ kind: "inflight" })}>
        approve
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

function stubMatchMedia(reducedMotion = false) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: reducedMotion && query.includes("prefers-reduced-motion"),
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

/**
 * jsdom has no layout, so the thread has no scroll geometry of its own: give it
 * a taller-than-tall content box with a real, readable/writable scrollTop, and
 * a scrollTo() helper that moves it the way a reader's wheel would (a `scroll`
 * event follows the position change).
 */
function stubScrollBox(node: HTMLElement, { scrollHeight = 1000, clientHeight = 200 } = {}) {
  let scrollTop = 0;
  Object.defineProperty(node, "scrollHeight", { value: scrollHeight, configurable: true });
  Object.defineProperty(node, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(node, "scrollTop", {
    configurable: true,
    get: () => scrollTop,
    set: (next: number) => {
      scrollTop = next;
    },
  });
  return {
    get top() {
      return scrollTop;
    },
    scrollTo(next: number) {
      scrollTop = next;
      fireEvent.scroll(node);
    },
  };
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

    // First paint is the story ALREADY PLAYED ONCE, so the panel arrives busy
    // instead of empty — but nothing is typing yet.
    expect(history()).toBe("small,over-limit");
    expect(typed()).toBe("");
    expect(screen.getByTestId("mode").textContent).toBe("static");

    // It rests there for the whole start hold, then the second pass types on
    // top of the seeded turns.
    await advance(TIMINGS.start - 1);
    expect(history()).toBe("small,over-limit");
    expect(phase()).toBe("dwell");
    await advance(1);
    expect(phase()).toBe("typing");
    await until(() => typed().startsWith("Send $500"));
    expect(typed().length).toBeLessThan(FIRST_PROMPT.length);

    // The first turn commits WHILE the second prompt is already typing — the
    // accumulation a per-scenario reset would fail.
    await until(() => history() === "small,over-limit,small");
    await until(() => typed().startsWith("Wire $60,000"));

    // The loop wraps and keeps appending instead of resetting.
    await until(() => history() === "small,over-limit,small,over-limit,small");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the completed thread on mount under reduced motion, without ever animating", async () => {
    stubMatchMedia(true);
    render(<Harness />);

    // The seeded first paint IS this audience's end state: the whole thread,
    // and no loop on top of it.
    expect(history()).toBe("small,over-limit");
    expect(screen.getByTestId("mode").textContent).toBe("static");

    // The loop never starts on its own; the play button is the opt-in.
    await advance(TIMINGS.start * 10);
    expect(history()).toBe("small,over-limit");
    expect(typed()).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    await until(() => typed().length > 0);
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

  it("an approval commits the turn with its reply, then counts down and restarts the story", async () => {
    render(<Harness />);
    await advance(TIMINGS.start);

    // Drive to the escalated turn resting on its decided frame — where the
    // governed dialog is on screen and a visitor could actually approve it.
    await until(() => history() === "small,over-limit,small" && phase() === "dwell");
    fireEvent.click(screen.getByRole("button", { name: "approve" }));

    // The in-flight turn commits, flagged so the thread renders the reply.
    expect(history()).toBe("small,over-limit,small,over-limit*");
    expect(phase()).toBe("approved");

    // A reading beat on the reply, then the counted-down restart pause.
    await advance(TIMINGS.approved);
    expect(phase()).toBe("restart");

    // Back to the top of the story, with the thread still accumulating.
    await advance(TIMINGS.restart);
    expect(phase()).toBe("typing");
    expect(screen.getByTestId("index").textContent).toBe("0");
    expect(history()).toBe("small,over-limit,small,over-limit*");
    await until(() => typed().startsWith("Send $500"));
  });

  it("hover does not stall the post-approval sequence, but the pause button does", async () => {
    render(<Harness />);
    await advance(TIMINGS.start);
    await until(() => history() === "small,over-limit,small" && phase() === "dwell");
    fireEvent.click(screen.getByRole("button", { name: "approve" }));

    // Closing the dialog leaves focus on its trigger INSIDE the panel, so a
    // hover/focus pause here would freeze the countdown indefinitely.
    const stage = screen.getByRole("region", { name: "conversation harness" });
    fireEvent.pointerEnter(stage);
    fireEvent.focus(stage);
    await advance(TIMINGS.approved);
    expect(phase()).toBe("restart");

    // The explicit pause button still holds it.
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    await advance(30_000);
    expect(phase()).toBe("restart");

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    await advance(TIMINGS.restart);
    expect(phase()).toBe("typing");
  });

  it("follows the newest turn only while the reader is at the bottom", async () => {
    render(<Harness />);
    const box = stubScrollBox(screen.getByTestId("thread"));
    await advance(TIMINGS.start);

    // At rest the thread is bottom-anchored, so each new stage is followed.
    await until(() => box.top === 1000);

    // The reader scrolls back through the conversation. From here every phase
    // change used to yank them down again, which read as "it won't let me
    // scroll" — the position must hold across the whole rest of the loop.
    box.scrollTo(120);
    const committed = history();
    await until(() => history() !== committed, 120_000);
    expect(box.top).toBe(120);

    // Scrolling back to the bottom re-arms the anchor.
    box.scrollTo(800);
    await until(() => box.top === 1000);
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
