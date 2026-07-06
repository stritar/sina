"use client";

/**
 * EmulatorShell — the split-screen orchestrator. Left: the chat (Composer +
 * ChatThread). Right: the interception console (ConsoleTimeline + AuditLedger),
 * fronted by the server-boundary marker. Holds run mode, theme, the turn list,
 * and the latest ConsoleView; calls the server-side gate and renders the decision.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Moon, ShieldCheck, Sun } from "@phosphor-icons/react/dist/ssr";
import type { AuditEvent } from "@sina-design-system/governance";
import type { IntentEnvelope } from "@sina-design-system/fintech";

import { gateExperience, gateIntent, gateLive } from "../_lib/run-emulator";
import { getScenario } from "@sina-design-system/governance-demo";
import { pretty } from "@sina-design-system/governance-demo";
import type { ConsoleView, Turn } from "@sina-design-system/governance-demo";
import { ChatThread } from "./ChatThread";
import { Composer } from "./Composer";
import { ConsoleTimeline } from "@sina-design-system/governance-demo";
import { AuditLedger } from "@sina-design-system/governance-demo";
import { ModeToggle, type Mode } from "./ModeToggle";
import styles from "./EmulatorShell.module.css";

const IDLE: ConsoleView = { kind: "idle" };

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function EmulatorShell({ initialScenarioId }: { initialScenarioId?: string }) {
  const [mode, setMode] = useState<Mode>("mock");
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [view, setView] = useState<ConsoleView>(IDLE);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const idRef = useRef(0);
  const retryRef = useRef<() => void>(() => {});

  // Theme: reflect onto <html> so SINA semantic tokens flip light/dark.
  useEffect(() => {
    const stored = window.localStorage.getItem("sina-theme");
    const initial =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
    setTheme(initial);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("sina-theme", theme);
  }, [theme]);

  async function run(prompt: string, fn: () => Promise<ConsoleView>) {
    const id = String(++idRef.current);
    retryRef.current = () => void run(prompt, fn);
    setBusy(true);
    setView(IDLE);
    setTurns((prev) => [...prev, { id, prompt, view: IDLE, streaming: true }]);

    // Block-the-stream: a brief skeleton before the gate "snaps shut".
    if (!prefersReducedMotion()) await sleep(450);

    const result = await fn();
    setTurns((prev) =>
      prev.map((turn) => (turn.id === id ? { ...turn, view: result, streaming: false } : turn)),
    );
    setView(result);
    if (result.kind === "gate" && result.trace.audit) {
      setAuditEvents((prev) => [...prev, result.trace.audit as AuditEvent]);
    } else if (result.kind === "experience") {
      const audits = result.traces
        .map((trace) => trace.audit)
        .filter((audit): audit is AuditEvent => audit !== null);
      if (audits.length > 0) setAuditEvents((prev) => [...prev, ...audits]);
    }
    setBusy(false);
  }

  // Approval re-gate resolved on the server: swap the turn's reply to the new
  // decision (approved → governed summary), reflect it in the console, and append
  // the fresh audit event — the approval is itself an audited governance decision.
  function handleApproved(turnId: string, next: ConsoleView) {
    setTurns((prev) => prev.map((turn) => (turn.id === turnId ? { ...turn, view: next } : turn)));
    setView(next);
    if (next.kind === "gate" && next.trace.audit) {
      setAuditEvents((prev) => [...prev, next.trace.audit as AuditEvent]);
    }
  }

  function pickScenario(id: string) {
    const scenario = getScenario(id);
    if (!scenario) return;
    if (mode === "mock") {
      const { envelopes } = scenario;
      void run(scenario.label, () =>
        envelopes ? gateExperience(envelopes) : gateIntent(scenario.envelope),
      );
    } else if (mode === "direct") {
      setInput(pretty(scenario.envelope));
    } else {
      setInput(scenario.prompt ?? scenario.label);
    }
  }

  function send() {
    if (busy) return;
    if (mode === "live") {
      const prompt = input.trim();
      if (!prompt) return;
      void run(prompt, () => gateLive(prompt));
      return;
    }
    if (mode === "direct") {
      const raw = input.trim();
      if (!raw) return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        void run("raw payload", async () => ({
          kind: "transport",
          error: { reason: "malformed", message: "Composer input is not valid JSON." },
        }));
        return;
      }
      if (!parsed || typeof parsed !== "object") {
        void run("raw payload", async () => ({
          kind: "transport",
          error: {
            reason: "malformed",
            message: "Direct input must be a JSON object: { intent, props }.",
          },
        }));
        return;
      }
      void run("raw payload", () => gateIntent(parsed as IntentEnvelope));
      return;
    }
    // mock: run the first scenario as a default if none picked yet
    const fallback = getScenario("over-limit");
    if (fallback) void run(fallback.label, () => gateIntent(fallback.envelope));
  }

  // Deep link: ?scenario=<id> runs that scenario on mount (mock).
  useEffect(() => {
    if (!initialScenarioId) return;
    const scenario = getScenario(initialScenarioId);
    if (scenario) {
      const { envelopes } = scenario;
      void run(scenario.label, () =>
        envelopes ? gateExperience(envelopes) : gateIntent(scenario.envelope),
      );
    }
  }, [initialScenarioId]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <ShieldCheck weight="fill" className={styles.brandIcon} aria-hidden />
          <span className={styles.brandTitle}>SINA Emulator</span>
          <span className={styles.sandbox}>
            governed-agent sandbox
          </span>
        </div>
        <div className={styles.controls}>
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={styles.themeButton}
          >
            {theme === "dark" ? <Sun weight="fill" className={styles.themeIcon} /> : <Moon weight="fill" className={styles.themeIcon} />}
          </button>
          <Link href="/primitives" className={styles.link}>
            Primitives →
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        {/* Chat (product world) */}
        <section className={styles.chat}>
          <div className={styles.chatScroll}>
            <ChatThread
              turns={turns}
              onRetry={() => retryRef.current()}
              onApproved={handleApproved}
            />
          </div>
          <div className={styles.spacer}>
            <Composer
              value={input}
              onChange={setInput}
              onSend={send}
              onPickScenario={pickScenario}
              disabled={busy}
            />
          </div>
        </section>

        {/* Console (inspector world) */}
        <section className={styles.console}>
          <div className={styles.consoleScroll}>
            <ConsoleTimeline view={view} />
          </div>
          <div className={styles.spacer}>
            <AuditLedger events={auditEvents} />
          </div>
        </section>
      </main>
    </div>
  );
}
