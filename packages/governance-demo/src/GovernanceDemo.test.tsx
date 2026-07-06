import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { GovernanceDemo } from "./GovernanceDemo";

// The gate is pure + synchronous, so the Server Component renders in jsdom just
// by invoking it — the same read-only path docs/landing mount at build.
describe("GovernanceDemo (read-only embed)", () => {
  it("renders the over-limit block with no axe violations", async () => {
    const { container } = render(<GovernanceDemo scenario="over-limit" />);
    // The console names the governed component the constitution forced.
    expect(container.textContent).toContain("SecureWireDialog");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("degrades gracefully for an unknown scenario", () => {
    const { container } = render(<GovernanceDemo scenario="does-not-exist" />);
    expect(container.textContent).toContain("Unknown scenario");
  });
});
