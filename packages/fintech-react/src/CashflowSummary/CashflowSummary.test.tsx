import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { cashflowFixtures } from "@sina-design-system/fintech";

import { CashflowSummary } from "./CashflowSummary.js";

describe("CashflowSummary", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<CashflowSummary payload={cashflowFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering a zero-cashflow period", async () => {
    const { container } = render(<CashflowSummary payload={cashflowFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known value from the valid fixture", () => {
    render(<CashflowSummary payload={cashflowFixtures.valid} />);
    expect(screen.getByText(/June 2026/)).toBeTruthy();
  });
});
