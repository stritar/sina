import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { insightFixtures } from "@sina-design-system/fintech";

import { InsightCard } from "./InsightCard.js";

describe("InsightCard", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<InsightCard payload={insightFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering a minimal insight with no metric", async () => {
    const { container } = render(<InsightCard payload={insightFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the insight body from the validated payload", () => {
    render(<InsightCard payload={insightFixtures.valid} />);
    expect(screen.getByText(/on track this month/i)).toBeTruthy();
  });
});
