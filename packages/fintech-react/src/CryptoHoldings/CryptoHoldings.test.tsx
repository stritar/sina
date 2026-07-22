import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { cryptoHoldingsFixtures } from "@sina-design-system/fintech";

import { CryptoHoldings } from "./CryptoHoldings.js";

describe("CryptoHoldings", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<CryptoHoldings payload={cryptoHoldingsFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<CryptoHoldings payload={cryptoHoldingsFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a holding's name from the validated payload", () => {
    render(<CryptoHoldings payload={cryptoHoldingsFixtures.valid} />);
    expect(screen.getByText(/Bitcoin/)).toBeTruthy();
  });
});
