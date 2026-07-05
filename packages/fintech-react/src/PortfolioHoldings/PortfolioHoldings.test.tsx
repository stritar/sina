import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { portfolioFixtures } from "@sina-design-system/fintech";

import { PortfolioHoldings } from "./PortfolioHoldings.js";

describe("PortfolioHoldings", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<PortfolioHoldings payload={portfolioFixtures.validHoldings} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<PortfolioHoldings payload={portfolioFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a labelled donut chart and the holdings list as text", () => {
    render(<PortfolioHoldings payload={portfolioFixtures.validHoldings} />);
    expect(screen.getByRole("img", { name: /allocation/i })).toBeTruthy();
    // The positions list is the accessible legend (symbol + value as text).
    expect(screen.getByText("AAPL")).toBeTruthy();
    expect(screen.getByText("MSFT")).toBeTruthy();
  });

  it("renders the empty state with no chart", () => {
    render(<PortfolioHoldings payload={portfolioFixtures.validEmpty} />);
    expect(screen.getByText("No holdings to show.")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
