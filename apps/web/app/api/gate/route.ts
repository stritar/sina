import {
  getScenario,
  regateGovernedAction,
  regateWireApproval,
  runExperience,
  runGate,
  type ActionEvidence,
  type ConsoleView,
  type WireApprovalEvidence,
} from "@sina-design-system/governance-demo/server";

/**
 * The docs demo's gate — the constitution, run server-side, at request time.
 *
 * This is what makes the embedded demo real rather than a recording: the reader clicks
 * Run, the envelope goes to a server, the SAME `runGate` a customer's backend would
 * call decides, and only the decision comes back. §1b holds on a docs page exactly as
 * it does in production — the browser never gates.
 *
 * `runtime = "edge"` is MANDATORY and must stay statically analyzable. next-on-pages
 * emits a runtime function for every Route Handler and refuses any that isn't Edge; a
 * Node-runtime handler aborts the entire Cloudflare Pages build, and a failed build
 * silently keeps serving the previous deploy. The import above is
 * `governance-demo/server` — the React-free entry — so React, Radix and the console
 * never land in the worker. Both facts are enforced by `app/cf-pages-safe.test.ts`.
 *
 * SURFACE. This endpoint is public and its body is attacker-controlled, so it accepts
 * the smallest thing that works: a scenario ID and an approver's evidence. It never
 * accepts a payload. The escalated terms are re-derived here from the canned catalog,
 * which means the client cannot influence what gets gated at all — it cannot even name
 * an intent the catalog doesn't have, and it cannot hand the audit walker a giant
 * nested object to chew through. The binding hash is computed server-side by
 * `regate*`, so an approval can only ever bind to the terms actually submitted.
 */

export const runtime = "edge";
// A decision is computed per request and must never be cached as if it were content.
export const dynamic = "force-dynamic";

/** Enough for `{ kind, scenarioId, evidence }` — an id plus a few short strings. */
const MAX_BODY_BYTES = 2048;
const MAX_FIELD_CHARS = 128;

function bad(status: number): Response {
  // Bare status, no message: nothing about the internals is worth leaking here.
  return new Response(null, { status });
}

/** Coerce one client-supplied string, or drop it. */
function field(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0
    ? value.slice(0, MAX_FIELD_CHARS)
    : undefined;
}

function wireEvidence(raw: unknown): WireApprovalEvidence | null {
  if (!raw || typeof raw !== "object") return null;
  const { approverId, approverName, secondFactor } = raw as Record<string, unknown>;
  const id = field(approverId);
  const name = field(approverName);
  if (!id || !name) return null;
  const factor = field(secondFactor);
  return { approverId: id, approverName: name, ...(factor ? { secondFactor: factor } : {}) };
}

function actionEvidence(raw: unknown): ActionEvidence | null {
  if (!raw || typeof raw !== "object") return null;
  const { approverId, approverName, secondFactor, acknowledged } = raw as Record<string, unknown>;
  return {
    ...(field(approverId) ? { approverId: field(approverId) } : {}),
    ...(field(approverName) ? { approverName: field(approverName) } : {}),
    ...(field(secondFactor) ? { secondFactor: field(secondFactor) } : {}),
    ...(acknowledged === true ? { acknowledged: true } : {}),
  };
}

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get("content-type")?.includes("application/json")) return bad(415);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return bad(413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return bad(400);
  }
  if (!body || typeof body !== "object") return bad(400);

  const { kind, scenarioId, evidence } = body as Record<string, unknown>;
  if (typeof scenarioId !== "string") return bad(400);

  // Default deny: an id that isn't in the catalog never reaches the constitution.
  const scenario = getScenario(scenarioId);
  if (!scenario) return bad(400);

  let view: ConsoleView;

  if (kind === "gate") {
    view =
      scenario.envelopes && scenario.envelopes.length > 0
        ? { kind: "experience", traces: runExperience(scenario.envelopes) }
        : { kind: "gate", trace: runGate(scenario.envelope) };
  } else if (kind === "regate-wire") {
    const approval = wireEvidence(evidence);
    if (!approval) return bad(400);
    // The terms come from the CATALOG, not from the client.
    view = regateWireApproval(scenario.envelope.props, approval);
  } else if (kind === "regate-action") {
    const stepUp = actionEvidence(evidence);
    if (!stepUp) return bad(400);
    view = regateGovernedAction(scenario.envelope.intent, scenario.envelope.props, stepUp);
  } else {
    return bad(400);
  }

  return Response.json(view, { headers: { "cache-control": "no-store" } });
}
