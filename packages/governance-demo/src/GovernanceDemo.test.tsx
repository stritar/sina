import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { GovernanceDemo } from "./GovernanceDemo.js";
import { GateTransportProvider } from "./TransportProvider.js";
import { regateWireApproval } from "./regate.js";
import { runGate } from "./gate.js";
import { getScenario } from "./scenarios.js";
import type { GateTransport } from "./transport.js";

// jsdom lacks these; Radix Dialog probes for them defensively.
if (!window.matchMedia) {
  // @ts-expect-error test shim
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
}

/**
 * A transport that runs the REAL gate, in-process. It stands in for the network hop,
 * not for the constitution — every decision below is the actual one `runGate` /
 * `regateWireApproval` produce, with the binding hash computed the same way the Edge
 * handler computes it. A stub that faked the decision would prove nothing.
 */
const realTransport: GateTransport = {
  runScenario: async (scenario) =>
    scenario.envelopes
      ? { kind: "experience", traces: scenario.envelopes.map(runGate) }
      : { kind: "gate", trace: runGate(scenario.envelope) },
  regateWire: async (context, evidence) => regateWireApproval(context.payload, evidence),
  regateAction: async () => ({ kind: "idle" }),
};

function mount(ui: React.ReactElement) {
  return render(<GateTransportProvider transport={realTransport}>{ui}</GateTransportProvider>);
}

/** Drive the dialog exactly as a reader would: review → collect → OTP → approve. */
async function approveAs(approverId: string, approverName: string) {
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole("button", { name: /Review wire transfer/i }, { timeout: 5000 }),
  );
  await user.click(await screen.findByRole("button", { name: /Request approval/i }));

  await user.type(screen.getByLabelText(/Approver ID/i), approverId);
  await user.type(screen.getByLabelText(/Approver name/i), approverName);
  await user.click(screen.getByRole("button", { name: /Send for approval/i }));

  // CredentialOTP distributes a typed block from the first box across all six.
  fireEvent.change(screen.getByLabelText(/digit 1/i), { target: { value: "123456" } });
  await user.click(screen.getByRole("button", { name: /^Approve$/i }));
}

describe("GovernanceDemo", () => {
  it("renders the over-limit escalation and names the component the gate forces", async () => {
    const { container } = mount(<GovernanceDemo scenario="over-limit" />);
    expect(container.textContent).toContain("SecureWireDialog");
    // The forced component is lazy — wait for it, or axe runs against an empty fallback.
    await screen.findByRole("button", { name: /Review wire transfer/i }, { timeout: 5000 });
    expect(await axe(container)).toHaveNoViolations();
  });

  /**
   * The regression that matters. The embed used to hand the comparison a hardcoded
   * `GovernedWireSummary` for ANY wire, so a rejected payload was announced as
   * "Governed & mounted" — "the payload cleared the constitution" — directly above a
   * timeline reading BLOCKED. Both docs scenarios below are blocked.
   */
  it.each([
    ["fabricated-confirm", "a smuggled Confirm button (schema reject)"],
    ["self-approval", "the initiator approving their own wire (four-eyes reject)"],
  ])("never claims a blocked payload passed: %s", async (scenario) => {
    const { container } = mount(<GovernanceDemo scenario={scenario} />);
    expect(container.textContent).toContain("Stream intercepted");
    expect(container.textContent).not.toContain("Governed & mounted");
    expect(container.textContent).not.toContain("cleared the constitution");
  });

  it("flips the decision when a DIFFERENT approver authorizes the wire", async () => {
    mount(<GovernanceDemo scenario="over-limit" />);
    expect(screen.getByText(/Stream intercepted/i)).toBeTruthy();

    await approveAs("mgr:jane", "Jane Okafor");

    // The server re-gated and passed, so the reply swaps: the blocked state (and the
    // dialog it forced) is replaced by the governed summary. The wire is through.
    await screen.findByText(/Governed & mounted/i);
    await waitFor(() => expect(screen.queryByText(/Stream intercepted/i)).toBeNull());
  });

  it("still refuses when the initiator approves their own wire", async () => {
    mount(<GovernanceDemo scenario="over-limit" />);

    // `agent:opus` is the server-known initiator the scenario was gated as.
    await approveAs("agent:opus", "Opus");

    // Four-eyes is checked server-side, so the dialog cannot be talked past it: it
    // reports the constitution's own reason and stays open, and the wire stays blocked.
    await screen.findByText(/Approval rejected/i);
    expect(screen.getAllByText(/cannot approve their own wire/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Stream intercepted/i)).toBeTruthy();
    expect(screen.queryByText(/Governed & mounted/i)).toBeNull();
  });

  it("re-runs the gate on demand", async () => {
    const user = userEvent.setup();
    mount(<GovernanceDemo scenario="over-limit" />);

    await user.click(screen.getByRole("button", { name: /Run the gate/i }));

    // The decision is recomputed, not replayed from the build-time HTML.
    await screen.findByText(/Stream intercepted/i);
  });

  it("degrades gracefully for an unknown scenario", () => {
    const { container } = mount(<GovernanceDemo scenario="does-not-exist" />);
    expect(container.textContent).toContain("Unknown scenario");
  });

  it("offers the sibling scenarios the page opted into", async () => {
    mount(
      <GovernanceDemo
        scenario="fabricated-confirm"
        scenarios={["fabricated-confirm", "small", "over-limit"]}
      />,
    );
    // Scoped to the picker: ComparisonToggle's tabs are aria-pressed buttons too.
    const picker = within(screen.getByRole("group", { name: /Pick a request/i }));
    expect(picker.getAllByRole("button")).toHaveLength(3);
    expect(picker.getByRole("button", { pressed: true }).textContent).toContain(
      getScenario("fabricated-confirm")!.label,
    );
  });
});
