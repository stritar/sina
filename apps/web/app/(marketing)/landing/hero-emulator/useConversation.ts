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
 * initial state (server render, and reduced motion permanently) is the fully
 * completed thread, so no-JS readers get the whole story and hydration matches.
 * The pair changes when the visitor switches industry — the [scenarios] effect
 * resets to that industry's static frame and restarts the loop.
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

export type ConversationPhase = "typing" | "sent" | "intent" | "gating" | "verdict" | "dwell";

/** Auto-mode pacing (ms). Exported so the timeline test drives real numbers. */
export const TIMINGS = {
  /** Hold before the first cycle so typing starts as the CSS entrance lands. */
  start: 1600,
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
} as const;

export interface ConversationTurn {
  scenario: EmulatorScenario;
  trace: EmulatorTrace;
}

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

function completedThread(scenarios: readonly EmulatorScenario[]): ConversationTurn[] {
  return scenarios.map((scenario) => ({ scenario, trace: cannedFor(scenario) })).slice(-HISTORY_CAP);
}

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
  /** The visible pause/play button: pause the loop, or (re)start it. */
  togglePlay: () => void;
  /** The composer's send button: commit the in-flight typing instantly. */
  fastForward: () => void;
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

  // Mount + industry switch: rest on the completed static frame, then (unless
  // reduced motion) clear the thread and start the loop after the entrance hold.
  useEffect(() => {
    setUserPaused(false);
    setState(staticFrame(scenarios));
    if (prefersReducedMotion()) return;
    const timer = setTimeout(
      () =>
        setState({
          history: [],
          scenarioIndex: 0,
          phase: "typing",
          typedChars: 0,
          trace: null,
          mode: "auto",
        }),
      TIMINGS.start,
    );
    return () => clearTimeout(timer);
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
    if (state.mode !== "auto" || paused) return;
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
  }, [state, paused, scenarios]);

  // Keep the newest stage in view; the thread scrolls, the stage never grows.
  useEffect(() => {
    const node = threadRef.current;
    if (node) node.scrollTop = node.scrollHeight;
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

  return {
    state,
    threadRef,
    playing: state.mode === "auto" && !userPaused,
    togglePlay,
    fastForward,
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
