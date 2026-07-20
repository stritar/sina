"use client";

import { useMemo, type CSSProperties } from "react";
import { Microphone, Pause, Play, PlusCircle, Waveform } from "@phosphor-icons/react/dist/ssr";
import { ChatBubble, ChatComposer, ChatThread, GateCard, IconButton } from "../../broadsheet";
import { INDUSTRIES, heroEmulator as copy } from "../copy";
import { useIndustry } from "../IndustryContext";
import { heroPairFor } from "./scenarios";
import { TIMINGS, useConversation } from "./useConversation";
import { ApprovalReply, TurnGate, TurnOutcome } from "./hero-outcomes";
import styles from "./HeroEmulator.module.css";

/**
 * The hero's conversation emulator (matured from the /hero-concepts Diptych):
 * an auto-playing chat thread where the governance gate rides INLINE in the
 * conversation. For the active industry it loops a two-turn story — a routine
 * ask that passes and renders its component, then a high-risk ask that
 * escalates to a governed dialog (fintech mounts the REAL SecureWireDialog;
 * healthcare/defense name an openly-simulated one). Turns accumulate like a
 * real messenger. Fully canned and zero-network; hover/focus/tab-hidden pause
 * it, and reduced motion / SSR rest on the completed static thread. The panel
 * fills the hero's right column absolutely, so the thread scrolls internally
 * and can never grow the hero.
 */
export function HeroEmulator({ className }: { className?: string }) {
  const { industry } = useIndustry();
  const definition = INDUSTRIES[industry];
  // Stable per-industry reference: heroPairFor builds a fresh array, and the
  // conversation engine keys its reset/restart effect on this identity.
  const pair = useMemo(() => heroPairFor(industry), [industry]);
  const { state, threadRef, playing, paused, togglePlay, fastForward, approve, pauseHandlers } =
    useConversation(pair);

  const current = pair[state.scenarioIndex];
  const inFlight = state.mode === "auto";
  // The terminal sequence has no in-flight turn: its turn already committed to
  // history, so re-showing the prompt bubble would duplicate it.
  const terminal = state.phase === "approved" || state.phase === "restart";
  const showUser = inFlight && !terminal && state.phase !== "typing";
  const checking = inFlight && (state.phase === "intent" || state.phase === "gating");
  const decided =
    inFlight && state.trace !== null && (state.phase === "verdict" || state.phase === "dwell");
  // The dwell is the only wait a visitor can't read off the panel, so it gets a
  // bar counting it down. Mounted only while the dwell timer is actually
  // running: a pause tears that timer down and re-schedules the FULL duration,
  // so unmounting is what keeps the animation honest on resume. The restart
  // pause after a visitor-driven approval counts down the same way, but only
  // the pause button holds it (`playing`), matching the machine's own guard.
  const counting =
    inFlight &&
    ((state.phase === "dwell" && !paused) || (state.phase === "restart" && playing));
  const countdownMs = state.phase === "restart" ? TIMINGS.restart : TIMINGS.dwell;

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
          <p className={styles.lede}>{copy.lede}</p>
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          icon={playing ? <Pause weight="bold" /> : <Play weight="bold" />}
          label={playing ? copy.pause : copy.play}
          onClick={togglePlay}
        />
        {counting ? (
          <span
            className={styles.countdown}
            style={{ "--hero-dwell": `${countdownMs}ms` } as CSSProperties}
            aria-hidden="true"
          />
        ) : null}
      </header>

      <div className={styles.body}>
        <ChatThread
          ref={threadRef}
          size="fill"
          className={styles.thread}
          aria-label={copy.threadLabel}
        >
          {state.history.map((turn, index) => (
            <div className={styles.turn} key={`${turn.scenario.id}-${index}`}>
              <ChatBubble variant="user" size="sm">
                <p className={styles.prompt}>{turn.scenario.prompt}</p>
              </ChatBubble>
              <TurnGate trace={turn.trace} />
              <TurnOutcome
                scenario={turn.scenario}
                trace={turn.trace}
                onApproved={() => approve({ kind: "history", index })}
              />
              {turn.approved ? <ApprovalReply /> : null}
            </div>
          ))}
          {showUser && current ? (
            <ChatBubble variant="user" size="sm">
              <p className={styles.prompt}>{current.prompt}</p>
            </ChatBubble>
          ) : null}
          {checking ? (
            <GateCard
              className={styles.gate}
              size="sm"
              kicker={copy.gateKicker}
              status="checking"
            />
          ) : null}
          {decided && current && state.trace ? (
            <div className={styles.turn}>
              <TurnGate trace={state.trace} />
              <TurnOutcome
                scenario={current}
                trace={state.trace}
                onApproved={() => approve({ kind: "inflight" })}
              />
            </div>
          ) : null}
        </ChatThread>

        <ChatComposer
          className={styles.composer}
          size="md"
          text={
            state.phase === "typing" && current
              ? current.prompt.slice(0, state.typedChars)
              : ""
          }
          caret={inFlight && state.phase === "typing"}
          placeholder={copy.composerPlaceholder}
          leadingIcon={<PlusCircle weight="fill" />}
          trailingIcon={<Microphone weight="fill" />}
          sendIcon={<Waveform weight="bold" />}
          sendLabel={copy.send}
          onSend={fastForward}
        />
      </div>
    </section>
  );
}
