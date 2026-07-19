"use client";

import { useEffect, useRef } from "react";
import { Pause, PaperPlaneRight, Play } from "@phosphor-icons/react/dist/ssr";
import { VisuallyHidden } from "@sina-design-system/core";
import { IconButton } from "../../broadsheet";
import { INDUSTRIES, emulator as copy, heroEmulator as heroCopy } from "../copy";
import { useIndustry } from "../IndustryContext";
import { usePlayback, type PlaybackPhase } from "./usePlayback";
import {
  GateStrip,
  IntentCard,
  OutcomeBubble,
  StoryStrip,
  TransportErrorBubble,
  UserBubble,
} from "./ThreadStages";
import styles from "./HeroEmulator.module.css";

/**
 * The hero's composer emulator: an auto-playing chat thread that tells the SINA
 * loop (user ask, agent intent, the gate, the outcome) for the active industry,
 * with real user-initiated runs on the chips and the send button (fintech goes
 * to the live /api/gate; healthcare/defense are openly canned). The panel fills
 * the hero's right column absolutely, so the thread scrolls internally and can
 * never grow the hero.
 */

const STORY_STEP: Record<PlaybackPhase, 0 | 1 | 2> = {
  typing: 0,
  sent: 0,
  intent: 1,
  gating: 1,
  verdict: 2,
  dwell: 2,
};

export function HeroEmulator({ className }: { className?: string }) {
  const { industry } = useIndustry();
  const definition = INDUSTRIES[industry];
  const { state, scenarios, autoRunning, userPaused, runScenario, togglePlay, pauseHandlers } =
    usePlayback(industry);

  const scenario = scenarios[state.scenarioIndex] ?? scenarios[0];
  const threadRef = useRef<HTMLDivElement>(null);

  const showUser = state.phase !== "typing";
  const showIntent = showUser && state.phase !== "sent";
  const checking = state.phase === "gating";
  const showGate = checking || state.trace !== null;
  const liveLoading = state.mode === "user" && checking;
  const looping = autoRunning && !userPaused;
  const atRest = state.phase === "dwell" || state.mode === "static";

  // Keep the newest stage in view; the thread scrolls, the hero never grows.
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [state.phase, state.trace, state.error]);

  // Screen-reader narration: only user-initiated runs announce (the auto loop
  // is silent so it cannot spam an SR user who never asked for it). Rendered
  // permanently so the live region exists before its content changes.
  const status =
    state.error !== null
      ? copy.transportTitle
      : state.mode === "user"
        ? checking
          ? copy.gateChecking
          : state.trace
            ? `${copy.stages.verdict.slice(3)}: ${copy.gateVerdict[state.trace.verdict]}`
            : ""
        : "";

  if (!scenario) return null;

  return (
    <section
      className={className ? `${styles.panel} ${className}` : styles.panel}
      aria-label={copy.heading}
      {...pauseHandlers}
    >
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.headerTitle}>
            {definition.name}
            <span className={styles.modeTag} data-live={definition.live || undefined}>
              {definition.modeTag}
            </span>
          </p>
          <p className={styles.modeLine}>{definition.live ? copy.gateLive : copy.gateSimulated}</p>
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          icon={looping ? <Pause weight="bold" /> : <Play weight="bold" />}
          label={looping ? heroCopy.pause : heroCopy.play}
          onClick={togglePlay}
        />
      </header>

      <StoryStrip activeStep={STORY_STEP[state.phase]} />

      <VisuallyHidden>
        <p role="status">{status}</p>
      </VisuallyHidden>

      <div className={styles.thread} ref={threadRef}>
        <div className={styles.threadInner}>
          {showUser ? <UserBubble prompt={scenario.prompt} /> : null}
          {showIntent ? <IntentCard scenario={scenario} /> : null}
          {showGate ? <GateStrip trace={state.trace} checking={checking} /> : null}
          {state.trace && !checking ? <OutcomeBubble trace={state.trace} /> : null}
          {state.error !== null ? (
            <TransportErrorBubble onRetry={() => runScenario(state.scenarioIndex)} />
          ) : null}
        </div>
      </div>

      <div className={styles.chipRow} role="group" aria-label={copy.pickLabel}>
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={styles.chip}
            data-broadsheet=""
            data-selected={i === state.scenarioIndex || undefined}
            onClick={() => runScenario(i)}
          >
            <span className={styles.chipLabel}>{s.chip}</span>
            <span className={styles.chipHint}>{copy.expected[s.expected]}</span>
          </button>
        ))}
      </div>

      <div className={styles.composer}>
        <div className={styles.composerInput} data-composer="" aria-hidden="true">
          {state.phase === "typing" && state.typedChars > 0 ? (
            <span className={styles.composerText}>
              {scenario.prompt.slice(0, state.typedChars)}
              <span className={styles.caret} />
            </span>
          ) : (
            <span className={styles.composerPlaceholder}>{heroCopy.composerPlaceholder}</span>
          )}
        </div>
        {atRest && state.mode !== "auto" ? (
          <button
            type="button"
            className={styles.textAction}
            data-broadsheet=""
            onClick={() => runScenario(state.scenarioIndex)}
          >
            {heroCopy.replay}
          </button>
        ) : null}
        <IconButton
          variant="primary"
          size="md"
          icon={<PaperPlaneRight weight="bold" />}
          label={heroCopy.send}
          loading={liveLoading}
          onClick={() => runScenario(state.scenarioIndex)}
        />
      </div>
    </section>
  );
}
