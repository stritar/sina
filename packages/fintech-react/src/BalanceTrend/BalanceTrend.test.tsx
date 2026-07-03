import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { balanceTrendFixtures } from "@sina-design-system/fintech";

import { BalanceTrend } from "./BalanceTrend.js";

describe("BalanceTrend", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<BalanceTrend payload={balanceTrendFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<BalanceTrend payload={balanceTrendFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the masked account label from the valid fixture", () => {
    render(<BalanceTrend payload={balanceTrendFixtures.valid} />);
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
  });
});
