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

  it("renders the masked account label and a labelled chart figure", () => {
    render(<BalanceTrend payload={balanceTrendFixtures.valid} />);
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    // The interactive LineChart is a labelled figure; the canvas is aria-hidden.
    expect(screen.getByRole("img", { name: /balance trend/i })).toBeTruthy();
  });

  it("renders the empty state with no chart", () => {
    render(<BalanceTrend payload={balanceTrendFixtures.validEmpty} />);
    expect(screen.getByText("No trend data.")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
