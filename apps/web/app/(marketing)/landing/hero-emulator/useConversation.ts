"use client";

/**
 * The hero emulator's conversation engine: a phase machine
 * (typing → sent → intent → gating → verdict → dwell) where a completed turn
 * COMMITS to an accumulating `history` instead of the thread resetting per
 * scenario, so the chat stacks and scrolls up like a real messenger. History is
 * capped so the infinite loop never grows the DOM unbounded (the thread's
 * overflow hides the cut). Matured from the /hero-concepts Diptych.
 *
 * Fully canned and zero-network: every trace comes from cannedFor(). The
 * initial state (server render and first paint) is the story ALREADY PLAYED
 * ONCE — every scenario committed to history — so the panel reads as a busy
 * thread mid-conversation the moment the page loads, and the loop that starts a
 * beat later is visibly its second pass. Under reduced motion the loop never
 * starts, so that audience simply keeps the completed thread. The pair changes
 * when the visitor switches industry — the [scenarios] effect re-seeds the
 * thread for the new industry and restarts the loop.
 *
 * One branch leaves the loop: if a visitor actually drives the escalated turn's
 * governed dialog to an approval, approve() commits that turn with a
 * confirmation reply (phase "approved"), then counts down (phase "restart") and
 * begins the story again from the first scenario.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from "react";
import type { EmulatorScenario, EmulatorTrace } from "../emulator/types";
import { cannedFor } from "./scenarios";

export type ConversationPhase =
  | "typing"
  | "sent"
  | "intent"
  | "gating"
  | "verdict"
  | "dwell"
  /** A visitor completed the governed dialog: the thread rests on the
   * confirmation reply, then counts down and restarts the story. */
  | "approved"
  | "restart";

/** Auto-mode pacing (ms). Exported so the timeline test drives real numbers. */
export const TIMINGS = {
  /** Hold after the page finishes loading before the first cycle types. */
  start: 1000,
  /** Per-character typing interval. */
  type: 28,
  /** Beat between the last typed character and the bubble committing. */
  send: 350,
  /** User bubble alone, before the intent beat. */
  sent: 400,
  /** Intent beat, before the gate starts checking. */
  intent: 900,
  /** The gate "checking" beat before the canned verdict lands. */
  gating: 700,
  /** Verdict beat before the resting dwell. */
  verdict: 1200,
  /** Reading time on the completed frame before the next scenario. */
  dwell: 4000,
  /** Reading time on the confirmation reply after a visitor-driven approval. */
  approved: 2000,
  /** The counted-down pause before the story restarts from scenario one. */
  restart: 3000,
} as const;

export interface ConversationTurn {
  scenario: EmulatorScenario;
  trace: EmulatorTrace;
  /** A visitor drove this turn's governed dialog to a successful approval, so
   * the thread renders a confirmation reply under it. */
  approved?: true;
}

/** Which turn a visitor just approved: the in-flight one, or a committed one. */
export type ApprovalSource = { kind: "inflight" } | { kind: "history"; index: number };

export interface ConversationState {
  /** Completed turns, oldest first, capped at HISTORY_CAP. */
  history: ConversationTurn[];
  /** The in-flight scenario (auto mode) — or where a restart would begin. */
  scenarioIndex: number;
  phase: ConversationPhase;
  /** Composer typing progress into the current scenario's prompt. */
  typedChars: number;
  /** Set once the gate has decided the in-flight turn (phase "verdict" onward). */
  trace: EmulatorTrace | null;
  mode: "auto" | "static";
}

/** Bounded thread length across infinite loops. */
export const HISTORY_CAP = 6;

/**
 * How far off the bottom still counts as "at the bottom" for the follow-the-
 * newest-turn anchor. Wide enough to absorb sub-pixel rounding on fractional
 * device-pixel ratios (a programmatic scrollTop = scrollHeight can settle a
 * fraction short), far narrower than any deliberate scroll back through the
 * thread.
 */
const BOTTOM_ANCHOR_SLACK = 8;

function completedThread(scenarios: readonly EmulatorScenario[]): ConversationTurn[] {
  return scenarios.map((scenario) => ({ scenario, trace: cannedFor(scenario) })).slice(-HISTORY_CAP);
}

/**
 * The resting frame: the whole story committed to history, machine inert.
 * Doubles as first paint (the thread is busy on arrival) and as the
 * reduced-motion end state.
 */
function staticFrame(scenarios: readonly EmulatorScenario[]): ConversationState {
  return {
    history: completedThread(scenarios),
    scenarioIndex: 0,
    phase: "dwell",
    typedChars: 0,
    trace: null,
    mode: "static",
  };
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface Conversation {
  state: ConversationState;
  /** Attach to the ChatThread — the driver keeps the newest turn scrolled into view. */
  threadRef: RefObject<HTMLDivElement | null>;
  /** True while the loop is the active driver and not explicitly paused
   * (hover/focus pauses don't flip the visible play/pause button). */
  playing: boolean;
  /** True while ANY pause source holds the loop (button, hover, focus, hidden
   * tab) — unlike `playing`, which only reflects the visible button. The dwell
   * countdown reads this so it restarts with the re-scheduled timer. */
  paused: boolean;
  /** The visible pause/play button: pause the loop, or (re)start it. */
  togglePlay: () => void;
  /** The composer's send button: commit the in-flight typing instantly. */
  fastForward: () => void;
  /** A visitor completed the governed dialog: commit + mark the turn, reply,
   * then count down and restart the story from the first scenario. */
  approve: (source: ApprovalSource) => void;
  /** Spread on the stage root: hover + focus pause the loop. */
  pauseHandlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
  };
}

export function useConversation(scenarios: readonly EmulatorScenario[]): Conversation {
  const [state, setState] = useState<ConversationState>(() => staticFrame(scenarios));
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const paused = userPaused || hoverPaused || focusPaused || hidden;

  const threadRef = useRef<HTMLDivElement | null>(null);

  // Mount + industry switch: rest on the story already played once, so the
  // thread arrives busy. Under reduced motion that IS the end state and nothing
  // animates; otherwise the loop takes over one hold after the page has loaded
  // and types the second pass on top of the seeded turns.
  useEffect(() => {
    setUserPaused(false);
    const seeded = staticFrame(scenarios);
    setState(seeded);
    if (prefersReducedMotion()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      timer = setTimeout(
        () =>
          setState({
            ...seeded,
            phase: "typing",
            mode: "auto",
          }),
        TIMINGS.start,
      );
    };

    // Measure the hold from "page fully loaded", not from mount: hydrating
    // early on a slow page shouldn't start the story under a half-drawn hero.
    const loaded = document.readyState === "complete";
    if (loaded) start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      if (timer) clearTimeout(timer);
      if (!loaded) window.removeEventListener("load", start);
    };
  }, [scenarios]);

  // Tab hidden pauses the loop; visible resumes it.
  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // The machine: schedule exactly one transition for the current phase.
  // Teardown on pause clears the pending timer; resume re-schedules the full
  // phase duration (typing keeps its character progress).
  useEffect(() => {
    if (state.mode !== "auto") return;
    // The post-approval sequence answers a deliberate visitor action, so only
    // the explicit pause button holds it. Hover/focus must NOT: closing the
    // dialog returns focus to its trigger INSIDE the panel, which would leave
    // focusPaused set and freeze the countdown until the visitor tabbed away.
    const terminal = state.phase === "approved" || state.phase === "restart";
    if (terminal ? userPaused : paused) return;

    if (state.phase === "approved") {
      const timer = setTimeout(
        () => setState((s) => ({ ...s, phase: "restart" })),
        TIMINGS.approved,
      );
      return () => clearTimeout(timer);
    }
    if (state.phase === "restart") {
      // Back to the top of the story. History is preserved: the thread keeps
      // accumulating, so the approved turn stays readable above the replay.
      const timer = setTimeout(
        () =>
          setState((s) => ({ ...s, scenarioIndex: 0, phase: "typing", typedChars: 0, trace: null })),
        TIMINGS.restart,
      );
      return () => clearTimeout(timer);
    }

    const scenario = scenarios[state.scenarioIndex];
    if (!scenario) return;

    let timer: ReturnType<typeof setTimeout>;
    switch (state.phase) {
      case "typing":
        timer =
          state.typedChars < scenario.prompt.length
            ? setTimeout(
                () => setState((s) => ({ ...s, typedChars: s.typedChars + 1 })),
                TIMINGS.type,
              )
            : setTimeout(
                () => setState((s) => ({ ...s, phase: "sent", typedChars: 0 })),
                TIMINGS.send,
              );
        break;
      case "sent":
        timer = setTimeout(() => setState((s) => ({ ...s, phase: "intent" })), TIMINGS.sent);
        break;
      case "intent":
        timer = setTimeout(() => setState((s) => ({ ...s, phase: "gating" })), TIMINGS.intent);
        break;
      case "gating":
        timer = setTimeout(
          () => setState((s) => ({ ...s, phase: "verdict", trace: cannedFor(scenario) })),
          TIMINGS.gating,
        );
        break;
      case "verdict":
        timer = setTimeout(() => setState((s) => ({ ...s, phase: "dwell" })), TIMINGS.verdict);
        break;
      case "dwell":
        // The finished turn COMMITS to history (capped) and the next scenario
        // starts typing — the accumulation a per-scenario reset would lose.
        timer = setTimeout(
          () =>
            setState((s) => {
              const done = scenarios[s.scenarioIndex];
              const history =
                done && s.trace
                  ? [...s.history, { scenario: done, trace: s.trace }].slice(-HISTORY_CAP)
                  : s.history;
              return {
                history,
                scenarioIndex: (s.scenarioIndex + 1) % scenarios.length,
                phase: "typing",
                typedChars: 0,
                trace: null,
                mode: "auto",
              };
            }),
          TIMINGS.dwell,
        );
        break;
    }
    return () => clearTimeout(timer);
  }, [state, paused, userPaused, scenarios]);

  // Follow the newest stage ONLY while the reader is already parked at the
  // bottom. An unconditional scroll-to-bottom here fights the reader: every
  // phase change (several per scenario) would yank a thread they had scrolled
  // back through down again, which reads as "the panel won't let me scroll".
  // Scrolling up releases the anchor; scrolling back to the bottom re-arms it.
  const stuckToBottom = useRef(true);

  useEffect(() => {
    const node = threadRef.current;
    if (!node) return;
    const onScroll = () => {
      // Our own programmatic scroll lands inside the threshold, so following a
      // turn never releases the anchor it just used.
      stuckToBottom.current =
        node.scrollHeight - node.scrollTop - node.clientHeight <= BOTTOM_ANCHOR_SLACK;
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const node = threadRef.current;
    if (node && stuckToBottom.current) node.scrollTop = node.scrollHeight;
  }, [state.history.length, state.phase, state.trace]);

  const togglePlay = useCallback(() => {
    if (state.mode !== "auto") {
      // Stopped on the static frame: start the loop from here, keeping the
      // completed thread (the cap absorbs the overlap). This is also how
      // reduced-motion readers opt INTO the animation.
      setUserPaused(false);
      setState((s) => ({ ...s, phase: "typing", typedChars: 0, trace: null, mode: "auto" }));
      return;
    }
    setUserPaused((p) => !p);
  }, [state.mode]);

  const fastForward = useCallback(() => {
    setState((s) => {
      if (s.mode !== "auto") {
        return { ...s, phase: "typing", typedChars: 0, trace: null, mode: "auto" };
      }
      if (s.phase !== "typing") return s;
      const scenario = scenarios[s.scenarioIndex];
      return scenario ? { ...s, typedChars: scenario.prompt.length } : s;
    });
  }, [scenarios]);

  // A visitor drove the governed dialog to an approval. The turn commits (with
  // its confirmation reply) and the machine hands off to the terminal sequence:
  // any pending dwell timer is torn down by the effect, which keys on `state`.
  const approve = useCallback((source: ApprovalSource) => {
    setState((s) => {
      const inFlight = scenarios[s.scenarioIndex];
      // Commit the in-flight turn first, so an approval never silently drops it
      // and `history.length - 1` addresses the turn that was just approved.
      const committed =
        s.mode === "auto" && inFlight && s.trace
          ? [...s.history, { scenario: inFlight, trace: s.trace }]
          : s.history;
      const target = source.kind === "history" ? source.index : committed.length - 1;
      if (source.kind === "inflight" && committed === s.history) return s;
      if (target < 0 || target >= committed.length) return s;

      const history = committed
        .map((turn, i) => (i === target ? { ...turn, approved: true as const } : turn))
        .slice(-HISTORY_CAP);
      // Reduced motion / the resting static frame: mark the reply, but there is
      // no running loop to count down and restart.
      if (s.mode !== "auto") return { ...s, history };
      return { ...s, history, phase: "approved", typedChars: 0, trace: null };
    });
  }, [scenarios]);

  return {
    state,
    threadRef,
    playing: state.mode === "auto" && !userPaused,
    paused,
    togglePlay,
    fastForward,
    approve,
    pauseHandlers: {
      onPointerEnter: () => setHoverPaused(true),
      onPointerLeave: () => setHoverPaused(false),
      onFocus: () => setFocusPaused(true),
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusPaused(false);
        }
      },
    },
  };
}
