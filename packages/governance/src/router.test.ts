import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  dispatch,
  dispatchAll,
  createRouter,
  pattern,
  UNKNOWN_INTENT,
  type PatternRegistry,
} from "./router.js";
import { intercept } from "./intercept.js";
import { resetAuditSink, setAuditSink } from "./audit.js";
import type { Violation } from "./contract.js";

const listSchema = z
  .object({ rows: z.array(z.object({ id: z.string() }).strict()).max(5) })
  .strict();

const registry: PatternRegistry = {
  // Ungoverned read: shape only, no policy, no escalation → mounts a presentational component.
  list_things: pattern({
    rule: { schema: listSchema, component: "ThingList", version: "1.0.0" },
  }),
  // Governed write: a policy escalates to a forced governed component.
  move_money: pattern({
    rule: {
      schema: z.object({ amount: z.number() }).strict(),
      policy: (): Violation[] => [{ code: "OVER_LIMIT", message: "too big", severity: "escalate" }],
      escalations: { OVER_LIMIT: "SecureDialog" },
    },
  }),
  // Context-bearing entry: owns its own `intercept` call + audit emit.
  with_context: {
    evaluate: (props) =>
      intercept({ schema: z.object({}).strict(), component: "CtxView", version: "1.0.0" }, props),
    component: "CtxView",
  },
};

afterEach(() => {
  resetAuditSink();
});

describe("dispatch — the intent router", () => {
  it("mounts the default presentational component on a clean ungoverned pass", () => {
    const decision = dispatch(registry, { intent: "list_things", props: { rows: [{ id: "a" }] } });
    expect(decision.result.valid).toBe(true);
    expect(decision.mount).toBe("ThingList");
    expect(decision.intent).toBe("list_things");
    expect(decision.props).toEqual({ rows: [{ id: "a" }] });
  });

  it("mounts nothing when an ungoverned read fails shape validation", () => {
    const decision = dispatch(registry, { intent: "list_things", props: { rows: "nope" } });
    expect(decision.result.valid).toBe(false);
    expect(decision.mount).toBeNull();
  });

  it("rejects a smuggled row action via nested .strict()", () => {
    const decision = dispatch(registry, {
      intent: "list_things",
      props: { rows: [{ id: "a", confirmButton: true }] },
    });
    expect(decision.result.valid).toBe(false);
    expect(decision.mount).toBeNull();
  });

  it("forces the governed component when a policy escalates", () => {
    const decision = dispatch(registry, { intent: "move_money", props: { amount: 100 } });
    expect(decision.result.valid).toBe(false);
    expect(decision.result.requiredComponent).toBe("SecureDialog");
    expect(decision.mount).toBe("SecureDialog");
  });

  it("default-denies an unknown intent and still audits it", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const decision = dispatch(registry, { intent: "do_evil", props: { x: 1 } });
    expect(decision.result.valid).toBe(false);
    expect(decision.result.violations[0]?.code).toBe(UNKNOWN_INTENT);
    expect(decision.mount).toBeNull();
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it("emits exactly one audit event for a rule entry, recording the mounted component", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    dispatch(registry, { intent: "list_things", props: { rows: [] } });
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink.mock.calls[0]?.[0].decidedComponent).toBe("ThingList");
  });

  it("delegates to an evaluate entry without double-emitting its audit event", () => {
    const sink = vi.fn();
    setAuditSink(sink);
    const decision = dispatch(registry, { intent: "with_context", props: {} });
    expect(decision.result.valid).toBe(true);
    expect(decision.mount).toBe("CtxView");
    expect(sink).toHaveBeenCalledTimes(1);
  });
});

describe("createRouter / dispatchAll", () => {
  it("createRouter binds a registry into a reusable router", () => {
    const route = createRouter(registry);
    expect(route({ intent: "list_things", props: { rows: [] } }).mount).toBe("ThingList");
  });

  it("dispatchAll routes each envelope of an experience independently", () => {
    const decisions = dispatchAll(registry, [
      { intent: "list_things", props: { rows: [] } },
      { intent: "do_evil", props: {} },
    ]);
    expect(decisions.map((decision) => decision.mount)).toEqual(["ThingList", null]);
  });
});
