import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { netWorthFixtures } from "@sina-design-system/fintech";

import { NetWorth } from "./NetWorth.js";

describe("NetWorth", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<NetWorth payload={netWorthFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the minimal (no-breakdown) payload", async () => {
    const { container } = render(<NetWorth payload={netWorthFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known breakdown label from the valid fixture", () => {
    render(<NetWorth payload={netWorthFixtures.valid} />);
    expect(screen.getByText(/Brokerage/i)).toBeTruthy();
  });
});
