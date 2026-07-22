"use client";

/**
 * Installs the docs' `GateTransport` — the seam every embedded `GovernanceDemo`
 * re-gates across.
 *
 * Here the server is an Edge Route Handler (`app/api/gate/route.ts`) rather than a
 * `"use server"` action: `apps/web` is a static site on Cloudflare Pages, so isolating
 * the one dynamic surface behind a `fetch` keeps every docs page statically rendered.
 * The gate still runs on a server — that is the only thing §1b cares about.
 *
 * Only a scenario ID and the approver's evidence go over the wire. The endpoint
 * re-derives the escalated terms from the canned catalog, so a reader can't smuggle a
 * payload into the constitution through the demo.
 */

import type {
  ActionEvidence,
  ConsoleView,
  GateTransport,
  RegateContext,
  Scenario,
  WireApprovalEvidence,
} from "@sina-design-system/governance-demo";
import { GateTransportProvider } from "@sina-design-system/governance-demo";
import type { ReactNode } from "react";

const ENDPOINT = "/api/gate";

/**
 * A failed round-trip is a TRANSPORT failure, not a governance decision — the console
 * renders the two differently on purpose, because "we couldn't ask" and "the
 * constitution said no" are not the same claim.
 */
function transportError(message: string): ConsoleView {
  return { kind: "transport", error: { reason: "error", message } };
}

async function post(body: unknown): Promise<ConsoleView> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return transportError(`The gate endpoint returned ${response.status}.`);
    }
    return (await response.json()) as ConsoleView;
  } catch {
    return transportError("Could not reach the gate endpoint.");
  }
}

/** The demo runs canned scenarios only, so a re-gate without one has nothing to bind to. */
function requireScenario(context: RegateContext): string | null {
  return context.scenarioId ?? null;
}

const docsTransport: GateTransport = {
  runScenario(scenario: Scenario): Promise<ConsoleView> {
    return post({ kind: "gate", scenarioId: scenario.id });
  },

  regateWire(context: RegateContext, evidence: WireApprovalEvidence): Promise<ConsoleView> {
    const scenarioId = requireScenario(context);
    if (!scenarioId) {
      return Promise.resolve(transportError("The docs demo re-gates canned scenarios only."));
    }
    return post({ kind: "regate-wire", scenarioId, evidence });
  },

  regateAction(context: RegateContext, evidence: ActionEvidence): Promise<ConsoleView> {
    const scenarioId = requireScenario(context);
    if (!scenarioId) {
      return Promise.resolve(transportError("The docs demo re-gates canned scenarios only."));
    }
    return post({ kind: "regate-action", scenarioId, evidence });
  },
};

export function GateTransportBoundary({ children }: { children: ReactNode }) {
  return <GateTransportProvider transport={docsTransport}>{children}</GateTransportProvider>;
}
