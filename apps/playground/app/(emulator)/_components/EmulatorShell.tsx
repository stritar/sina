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

import { gateIntent, gateLive } from "../_lib/run-emulator";
import { getScenario } from "../_lib/scenarios";
import { pretty } from "../_lib/format";
import type { ConsoleView, Turn } from "../_lib/types";
import { ChatThread } from "./ChatThread";
import { Composer } from "./Composer";
import { ConsoleTimeline } from "./ConsoleTimeline";
import { AuditLedger } from "./AuditLedger";
import { ModeToggle, type Mode } from "./ModeToggle";

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
      void run(scenario.label, () => gateIntent(scenario.payload));
    } else if (mode === "direct") {
      setInput(pretty(scenario.payload));
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
      void run("raw payload", () => gateIntent(parsed));
      return;
    }
    // mock: run the first scenario as a default if none picked yet
    const fallback = getScenario("over-limit");
    if (fallback) void run(fallback.label, () => gateIntent(fallback.payload));
  }

  // Deep link: ?scenario=<id> runs that scenario on mount (mock).
  useEffect(() => {
    if (!initialScenarioId) return;
    const scenario = getScenario(initialScenarioId);
    if (scenario) void run(scenario.label, () => gateIntent(scenario.payload));
  }, [initialScenarioId]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-success" aria-hidden />
          <span className="text-base font-semibold tracking-tight">SINA Emulator</span>
          <span className="hidden font-mono text-xs text-text-subtle sm:inline">
            governed-agent sandbox
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="flex size-7 items-center justify-center rounded-md border border-border-subtle text-text-muted hover:bg-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
          >
            {theme === "dark" ? <Sun className="size-control-xs" /> : <Moon className="size-control-xs" />}
          </button>
          <Link
            href="/primitives"
            className="font-mono text-xs text-text-muted hover:text-text"
          >
            Primitives →
          </Link>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Chat (product world) */}
        <section className="flex flex-col gap-4 p-4 lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <ChatThread
              turns={turns}
              onRetry={() => retryRef.current()}
              onApproved={handleApproved}
            />
          </div>
          <div className="shrink-0">
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
        <section className="flex flex-col gap-3 border-t border-border p-4 lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden lg:border-l lg:border-t-0">
          <div className="flex-1 overflow-y-auto rounded-lg border border-border-subtle bg-surface">
            <ConsoleTimeline view={view} />
          </div>
          <div className="shrink-0">
            <AuditLedger events={auditEvents} />
          </div>
        </section>
      </main>
    </div>
  );
}
