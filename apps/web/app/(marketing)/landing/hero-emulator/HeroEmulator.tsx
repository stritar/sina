"use client";

import { useMemo } from "react";
import { Pause, PaperPlaneRight, Play } from "@phosphor-icons/react/dist/ssr";
import { ChatBubble, ChatComposer, ChatThread, GateCard, IconButton } from "../../broadsheet";
import { INDUSTRIES, heroEmulator as copy } from "../copy";
import { useIndustry } from "../IndustryContext";
import { heroPairFor } from "./scenarios";
import { useConversation } from "./useConversation";
import { TurnGate, TurnOutcome } from "./hero-outcomes";
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
  const { state, threadRef, playing, togglePlay, fastForward, pauseHandlers } =
    useConversation(pair);

  const current = pair[state.scenarioIndex];
  const inFlight = state.mode === "auto";
  const showUser = inFlight && state.phase !== "typing";
  const checking = inFlight && (state.phase === "intent" || state.phase === "gating");
  const decided =
    inFlight && state.trace !== null && (state.phase === "verdict" || state.phase === "dwell");

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
      </header>

      <div className={styles.body}>
        <ChatThread ref={threadRef} size="fill" aria-label={copy.threadLabel}>
          {state.history.map((turn, index) => (
            <div className={styles.turn} key={`${turn.scenario.id}-${index}`}>
              <ChatBubble variant="user" size="sm" kicker={copy.youKicker}>
                <p className={styles.prompt}>{turn.scenario.prompt}</p>
              </ChatBubble>
              <TurnGate trace={turn.trace} />
              <TurnOutcome scenario={turn.scenario} trace={turn.trace} />
            </div>
          ))}
          {showUser && current ? (
            <ChatBubble variant="user" size="sm" kicker={copy.youKicker}>
              <p className={styles.prompt}>{current.prompt}</p>
            </ChatBubble>
          ) : null}
          {checking ? <GateCard size="sm" kicker={copy.gateKicker} status="checking" /> : null}
          {decided && current && state.trace ? (
            <div className={styles.turn}>
              <TurnGate trace={state.trace} />
              <TurnOutcome scenario={current} trace={state.trace} />
            </div>
          ) : null}
        </ChatThread>

        <ChatComposer
          size="md"
          text={
            state.phase === "typing" && current
              ? current.prompt.slice(0, state.typedChars)
              : ""
          }
          caret={inFlight && state.phase === "typing"}
          placeholder={copy.composerPlaceholder}
          sendIcon={<PaperPlaneRight weight="bold" />}
          sendLabel={copy.send}
          onSend={fastForward}
        />
      </div>
    </section>
  );
}
