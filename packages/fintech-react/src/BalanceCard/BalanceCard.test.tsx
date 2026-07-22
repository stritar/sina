import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { balanceFixtures } from "@sina-design-system/fintech";

import { BalanceCard } from "./BalanceCard.js";

describe("BalanceCard", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<BalanceCard payload={balanceFixtures.validBalance} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the available and current balances", () => {
    render(<BalanceCard payload={balanceFixtures.validBalance} />);
    expect(screen.getByText("Available")).toBeTruthy();
    expect(screen.getByText("$4,820.00")).toBeTruthy();
    expect(screen.getByText("$5,000.00")).toBeTruthy();
  });
});
