import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { orderHistoryFixtures } from "@sina-design-system/fintech";

import { OrderHistory } from "./OrderHistory.js";

describe("OrderHistory", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<OrderHistory payload={orderHistoryFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<OrderHistory payload={orderHistoryFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a symbol from the validated payload", () => {
    render(<OrderHistory payload={orderHistoryFixtures.valid} />);
    expect(screen.getByText("AAPL")).toBeTruthy();
  });
});
