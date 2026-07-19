"use client";

/**
 * The hero emulator's playback engine. Two drivers share one state shape:
 *
 * - AUTO mode is a timeout-per-phase machine run by an effect: pausing (hover,
 *   focus, tab hidden, or the visible pause button) simply stops scheduling,
 *   and resuming re-schedules the current phase's full duration. Traces are
 *   always canned (zero network on a loop the visitor never asked to run).
 * - USER mode (chip / send / replay) is an imperative async chain with run-id
 *   invalidation, ported from the old mid-page Emulator: fintech runs the REAL
 *   /api/gate through emulator/transport.ts, everything else plays its canned
 *   result. A user run stops the loop; it stays stopped until the visitor
 *   presses play or switches industry.
 *
 * The initial state (server render, and jsdom where reduced motion is stubbed
 * on) is the completed default-scenario frame built from the deterministic
 * canned trace, so no-JS readers get a full story and hydration matches.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Industry } from "../copy";
import { INDUSTRIES } from "../copy";
import { runFintechScenario } from "../emulator/transport";
import type { EmulatorScenario, EmulatorTrace } from "../emulator/types";
import { SCENARIO_SETS, cannedFor, isSimulated } from "./scenarios";

export type PlaybackPhase = "typing" | "sent" | "intent" | "gating" | "verdict" | "dwell";
export type PlaybackMode = "auto" | "user" | "static";

export interface PlaybackState {
  scenarioIndex: number;
  phase: PlaybackPhase;
  /** Composer typing progress into the scenario prompt (auto mode only). */
  typedChars: number;
  /** Set when the gate has decided (phase "verdict" onward). */
  trace: EmulatorTrace | null;
  /** Transport failure from a live run; never set by canned playback. */
  error: string | null;
  mode: PlaybackMode;
}

/** Auto-mode pacing (ms). Exported so the timeline test drives real numbers. */
export const TIMINGS = {
  /** Hold before the first cycle so typing starts as the CSS entrance lands. */
  start: 1600,
  /** Shorter hold when the visitor switches industry. */
  switch: 400,
  /** Per-character typing interval. */
  type: 28,
  /** Beat between the last typed character and the bubble committing. */
  send: 350,
  /** User bubble alone, before the intent card appears. */
  sent: 400,
  /** Intent card alone, before the gate starts checking. */
  intent: 900,
  /** The gate "checking" beat before the canned verdict lands. */
  gating: 700,
  /** Verdict beat before the resting dwell. */
  verdict: 1200,
  /** Reading time on the completed frame before the next scenario. */
  dwell: 4000,
} as const;

function staticFrame(scenarios: readonly EmulatorScenario[]): PlaybackState {
  const first = scenarios[0];
  return {
    scenarioIndex: 0,
    phase: "dwell",
    typedChars: 0,
    trace: first ? cannedFor(first) : null,
    error: null,
    mode: "static",
  };
}

function freshRun(scenarioIndex: number, mode: PlaybackMode): PlaybackState {
  return { scenarioIndex, phase: "typing", typedChars: 0, trace: null, error: null, mode };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface Playback {
  state: PlaybackState;
  scenarios: readonly EmulatorScenario[];
  /** True while the auto loop is the active driver (paused or not). */
  autoRunning: boolean;
  /** True when the visible pause button is engaged. */
  userPaused: boolean;
  /** Run one scenario in user mode (fintech goes to the real gate). */
  runScenario: (index: number) => void;
  /** The visible pause/play button: pause the loop, or (re)start it. */
  togglePlay: () => void;
  /** Spread on the panel root: hover + focus pause the auto loop. */
  pauseHandlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  };
}

export function usePlayback(industry: Industry): Playback {
  const scenarios = SCENARIO_SETS[industry];
  const live = INDUSTRIES[industry].live;

  const [state, setState] = useState<PlaybackState>(() => staticFrame(scenarios));
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const paused = userPaused || hoverPaused || focusPaused || hidden;

  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const mountedOnceRef = useRef(false);

  // Invalidate any in-flight user run (stale steps check the run id and bail).
  const cancel = useCallback(() => {
    runIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  // Mount + industry switch: reset to the industry's static frame, then (unless
  // reduced motion) clear the thread and start the auto loop after a hold.
  useEffect(() => {
    cancel();
    setUserPaused(false);
    setState(staticFrame(scenarios));
    if (prefersReducedMotion()) return;
    const hold = mountedOnceRef.current ? TIMINGS.switch : TIMINGS.start;
    mountedOnceRef.current = true;
    const timer = setTimeout(() => setState(freshRun(0, "auto")), hold);
    return () => clearTimeout(timer);
  }, [industry, scenarios, cancel]);

  // Abort outstanding work on unmount.
  useEffect(() => cancel, [cancel]);

  // Tab hidden pauses the loop; visible resumes it.
  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // The auto machine: schedule exactly one transition for the current phase.
  // Teardown on pause clears the pending timer; resume re-runs the effect and
  // re-schedules the phase's full duration (typing keeps its progress).
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
        timer = setTimeout(
          () => setState((s) => freshRun((s.scenarioIndex + 1) % scenarios.length, "auto")),
          TIMINGS.dwell,
        );
        break;
    }
    return () => clearTimeout(timer);
  }, [state, paused, scenarios]);

  const runScenario = useCallback(
    (index: number) => {
      const scenario = scenarios[index];
      if (!scenario) return;
      cancel();
      const runId = runIdRef.current;
      const reduced = prefersReducedMotion();
      const beat = (ms: number) => sleep(reduced ? 0 : ms);
      const stale = () => runId !== runIdRef.current;

      void (async () => {
        // Fast-forward theater: the full prompt lands in the composer at once,
        // then the same staged beats as auto play (collapsed under reduced motion).
        setState({ ...freshRun(index, "user"), typedChars: scenario.prompt.length });
        await beat(TIMINGS.send);
        if (stale()) return;
        setState((s) => ({ ...s, phase: "sent", typedChars: 0 }));
        await beat(TIMINGS.sent);
        if (stale()) return;
        setState((s) => ({ ...s, phase: "intent" }));
        await beat(TIMINGS.intent);
        if (stale()) return;
        setState((s) => ({ ...s, phase: "gating" }));

        let trace: EmulatorTrace;
        if (live && !isSimulated(scenario)) {
          const controller = new AbortController();
          abortRef.current = controller;
          const outcome = await runFintechScenario(scenario, controller.signal);
          if (stale()) return;
          if (!outcome.ok) {
            setState((s) => ({ ...s, phase: "dwell", error: outcome.message }));
            return;
          }
          trace = outcome.trace;
        } else {
          await beat(TIMINGS.gating);
          if (stale()) return;
          trace = cannedFor(scenario);
        }

        setState((s) => ({ ...s, phase: "verdict", trace }));
        await beat(TIMINGS.verdict);
        if (stale()) return;
        setState((s) => ({ ...s, phase: "dwell" }));
      })();
    },
    [scenarios, live, cancel],
  );

  const togglePlay = useCallback(() => {
    if (state.mode !== "auto") {
      // The loop is stopped (static frame or a finished user run): start it
      // from the current scenario. This is also how reduced-motion readers
      // opt INTO the animation.
      cancel();
      setUserPaused(false);
      setState((s) => freshRun(s.scenarioIndex, "auto"));
      return;
    }
    setUserPaused((p) => !p);
  }, [state.mode, cancel]);

  return {
    state,
    scenarios,
    autoRunning: state.mode === "auto",
    userPaused,
    runScenario,
    togglePlay,
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
