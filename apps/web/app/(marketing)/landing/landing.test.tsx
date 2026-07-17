import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

// The nav's LanguageSwitcher reads the route; no Next router exists in vitest.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

beforeAll(() => {
  // Radix dropdown (LanguageSwitcher) measures + captures pointers; jsdom has neither.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();

  // Reduced motion ON so the emulator's artificial delays collapse to zero and
  // runs resolve as fast as their (mocked) transport.
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
});

import { MarketingHome } from "../MarketingHome";

/** A canned /api/gate reply in the real ConsoleView shape. */
function gateView(trace: Record<string, unknown>) {
  return {
    ok: true,
    json: async () => ({ kind: "gate", trace }),
  } as Response;
}

const ESCALATE_TRACE = {
  intent: "wire_transfer",
  payload: {},
  result: {
    valid: false,
    violations: [
      {
        code: "SAR_REVIEW",
        severity: "flag",
        message: "Aggregate activity may be SAR reportable.",
        standard: "FinCEN SAR",
      },
      {
        code: "AMOUNT_REQUIRES_APPROVAL",
        severity: "escalate",
        message: "Amounts above $50,000 require a second approver.",
        standard: "SINA dual control",
      },
    ],
    requiredComponent: "SecureWireDialog",
  },
  mount: "SecureWireDialog",
  audit: null,
  latencyMs: 3.4,
  schemaViolations: [],
  policyViolations: [],
};

const PASS_TRACE = {
  intent: "list_transactions",
  payload: {},
  result: { valid: true, violations: [], requiredComponent: null },
  mount: "TransactionList",
  audit: null,
  latencyMs: 2.2,
  schemaViolations: [],
  policyViolations: [],
};

const REJECT_TRACE = {
  intent: "wire_transfer",
  payload: {},
  result: {
    valid: false,
    violations: [
      {
        code: "SCHEMA_INVALID",
        severity: "reject",
        message: "Unrecognized key: confirmButton. The schema is closed.",
      },
    ],
    requiredComponent: null,
  },
  mount: null,
  audit: null,
  latencyMs: 1.8,
  schemaViolations: [],
  policyViolations: [],
};

describe("landing page", () => {
  it("renders the idle page with no axe violations", async () => {
    const { container } = render(<MarketingHome locale="en" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "governed design system",
    );
    // Fintech is the default: live tag present, no coming-soon badge.
    expect(screen.getByText("Live demo")).toBeDefined();
    expect(screen.queryByText("Coming soon")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("switching to healthcare shows the coming-soon tag and the simulated labels", async () => {
    const user = userEvent.setup();
    render(<MarketingHome locale="en" />);

    await user.click(screen.getByRole("radio", { name: "Healthcare" }));

    expect(screen.getByText("Coming soon")).toBeDefined();
    expect(screen.getByText("Simulated preview")).toBeDefined();
    expect(screen.getByText("Simulated preview. Runs in your browser.")).toBeDefined();
    expect(screen.queryByText("Live demo")).toBeNull();

    // Back to fintech: the tag goes away.
    await user.click(screen.getByRole("radio", { name: "Fintech" }));
    expect(screen.queryByText("Coming soon")).toBeNull();
  });

  it("runs the default $60k fintech scenario against the (mocked) real gate and escalates", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(gateView(ESCALATE_TRACE));
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<MarketingHome locale="en" />);
    await user.click(screen.getByRole("button", { name: /run the gate/i }));

    expect(await screen.findByText("Escalated: approval required")).toBeDefined();
    // Only the catalog id crosses the wire; the server re-derives the terms.
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/gate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ kind: "gate", scenarioId: "over-limit" }),
      }),
    );
    // The gate stage lists the cited violations.
    expect(screen.getByText("Amounts above $50,000 require a second approver.")).toBeDefined();
    expect(screen.getByText("SecureWireDialog")).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("mounts the component sketch on a clean pass", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(gateView(PASS_TRACE)));

    const { container } = render(<MarketingHome locale="en" />);
    await user.click(screen.getByRole("radio", { name: /show my last two transactions/i }));
    await user.click(screen.getByRole("button", { name: /run the gate/i }));

    expect(await screen.findByText("Mounted")).toBeDefined();
    expect(screen.getByText("TransactionList")).toBeDefined();
    expect(screen.getByText("No violations.")).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a blocked verdict as a text-only alert with SIBLING badges (never nested)", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(gateView(REJECT_TRACE)));

    const { container } = render(<MarketingHome locale="en" />);
    await user.click(screen.getByRole("radio", { name: /sneak in a confirm button/i }));
    await user.click(screen.getByRole("button", { name: /run the gate/i }));

    expect(await screen.findByText("Blocked")).toBeDefined();
    const alert = container.querySelector('[data-sina-status="alert"]');
    const badge = container.querySelector('[data-sina-status="badge"]');
    expect(alert).not.toBeNull();
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain("SCHEMA_INVALID");
    // The no-nested-status rule: the badge row is a sibling, not a descendant.
    expect(alert!.contains(badge!)).toBe(false);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a transport failure as a warning, distinct from a governance block", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { container } = render(<MarketingHome locale="en" />);
    await user.click(screen.getByRole("button", { name: /run the gate/i }));

    // Appears twice on purpose: the visible Alert title + the SR status line.
    expect((await screen.findAllByText("Could not reach the gate")).length).toBeGreaterThan(0);
    expect(screen.getByText(/not a governance decision/)).toBeDefined();
    expect(screen.getByRole("button", { name: /try again/i })).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("plays the canned healthcare co-sign escalation without touching the network", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<MarketingHome locale="en" />);
    await user.click(screen.getByRole("radio", { name: "Healthcare" }));
    await user.click(screen.getByRole("radio", { name: /order 12 mg hydromorphone/i }));
    await user.click(screen.getByRole("button", { name: /run the gate/i }));

    expect(await screen.findByText("Escalated: approval required")).toBeDefined();
    expect(screen.getByText("CoSignDialog")).toBeDefined();
    expect(screen.getByText(/\(simulated\)/)).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("plays the canned defense two-person-control escalation", async () => {
    const user = userEvent.setup();
    render(<MarketingHome locale="en" />);

    await user.click(screen.getByRole("radio", { name: "Defense" }));
    expect(screen.getByText("Coming soon")).toBeDefined();
    await user.click(screen.getByRole("button", { name: /run the gate/i }));

    expect(await screen.findByText("Escalated: approval required")).toBeDefined();
    expect(screen.getByText("DualAuthDialog")).toBeDefined();
    expect(screen.getByText(/two person control/)).toBeDefined();
  });
});
