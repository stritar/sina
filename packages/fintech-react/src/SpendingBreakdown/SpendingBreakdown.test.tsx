import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { spendingFixtures } from "@sina-design-system/fintech";

import { SpendingBreakdown } from "./SpendingBreakdown.js";

describe("SpendingBreakdown", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<SpendingBreakdown payload={spendingFixtures.validBreakdown} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<SpendingBreakdown payload={spendingFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a labelled pie chart and the category legend as text", () => {
    render(<SpendingBreakdown payload={spendingFixtures.validBreakdown} />);
    expect(screen.getByRole("img", { name: /by category/i })).toBeTruthy();
    // The category rows are the accessible legend (label + amount as text).
    expect(screen.getByText("Dining")).toBeTruthy();
    expect(screen.getByText("Groceries")).toBeTruthy();
  });

  it("renders the empty state with no chart", () => {
    render(<SpendingBreakdown payload={spendingFixtures.validEmpty} />);
    expect(screen.getByText("No spending to show.")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
