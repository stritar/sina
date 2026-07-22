// @vitest-environment node

/**
 * The docs' public gate endpoint.
 *
 * The filename is `route.test.ts`, not `route.ts`, so neither Next nor the
 * cf-pages-safe guard treats it as a handler.
 *
 * What matters here isn't that the happy path returns 200 — it's that the endpoint is
 * a real gate and not a rubber stamp. It is public and its body is attacker-controlled,
 * so the tests below pin the two properties that make that safe: it will only gate
 * things the canned catalog already names, and it enforces the constitution on a
 * re-gate exactly as the playground does. Four-eyes is checked *server-side*, so
 * approving your own wire through the raw HTTP endpoint fails just as it does in the UI.
 */

import { describe, expect, it } from "vitest";

import { POST } from "./route";

function post(body: unknown, contentType = "application/json"): Promise<Response> {
  return POST(
    new Request("https://sinahub.app/api/gate", {
      method: "POST",
      headers: { "content-type": contentType },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

/** The wire the constitution escalates: $60k, over the $50k approval limit. */
const OVER_LIMIT = "over-limit";

/** The server-known initiator. Approving as this identity is self-approval. */
const INITIATOR = "agent:opus";

describe("POST /api/gate", () => {
  it("gates a canned scenario and reports the component the constitution forces", async () => {
    const response = await post({ kind: "gate", scenarioId: OVER_LIMIT });
    expect(response.status).toBe(200);
    // A decision is computed per request — it must never be cached as content.
    expect(response.headers.get("cache-control")).toBe("no-store");

    const view = await response.json();
    expect(view.kind).toBe("gate");
    expect(view.trace.result.valid).toBe(false);
    expect(view.trace.result.requiredComponent).toBe("SecureWireDialog");
  });

  it("default-denies a scenario that isn't in the catalog", async () => {
    // The client names a scenario, never a payload — so an intent the constitution
    // doesn't route cannot even be expressed through this endpoint.
    expect((await post({ kind: "gate", scenarioId: "not-a-scenario" })).status).toBe(400);
  });

  it("rejects an unknown kind, a non-JSON body, and a wrong content type", async () => {
    expect((await post({ kind: "drop-tables", scenarioId: OVER_LIMIT })).status).toBe(400);
    expect((await post("{ not json")).status).toBe(400);
    expect((await post({ kind: "gate", scenarioId: OVER_LIMIT }, "text/plain")).status).toBe(415);
  });

  it("refuses an oversized body before parsing it", async () => {
    const huge = JSON.stringify({ kind: "gate", scenarioId: OVER_LIMIT, pad: "x".repeat(4096) });
    expect((await post(huge)).status).toBe(413);
  });

  it("enforces four-eyes on the re-gate — you cannot approve your own wire", async () => {
    const response = await post({
      kind: "regate-wire",
      scenarioId: OVER_LIMIT,
      evidence: { approverId: INITIATOR, approverName: "Opus", secondFactor: "123456" },
    });
    expect(response.status).toBe(200);

    const view = await response.json();
    expect(view.trace.result.valid).toBe(false);
    expect(view.trace.result.violations.map((v: { code: string }) => v.code)).toContain(
      "SELF_APPROVAL_FORBIDDEN",
    );
  });

  it("clears the wire when a different approver authorizes it", async () => {
    const response = await post({
      kind: "regate-wire",
      scenarioId: OVER_LIMIT,
      evidence: { approverId: "mgr:jane", approverName: "Jane Okafor", secondFactor: "123456" },
    });
    const view = await response.json();
    expect(view.trace.result.valid).toBe(true);
  });

  it("rejects a re-gate with no approver", async () => {
    expect(
      (await post({ kind: "regate-wire", scenarioId: OVER_LIMIT, evidence: {} })).status,
    ).toBe(400);
  });
});
