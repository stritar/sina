import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { savingsGoalFixtures } from "@sina-design-system/fintech";

import { SavingsGoal } from "./SavingsGoal.js";

describe("SavingsGoal", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<SavingsGoal payload={savingsGoalFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<SavingsGoal payload={savingsGoalFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a goal name from the validated payload", () => {
    render(<SavingsGoal payload={savingsGoalFixtures.valid} />);
    expect(screen.getByText(/Emergency Fund/i)).toBeTruthy();
  });
});
