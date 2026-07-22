import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { fxQuoteFixtures } from "@sina-design-system/fintech";

import { FxQuote } from "./FxQuote.js";

describe("FxQuote", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<FxQuote payload={fxQuoteFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering a quote without a spread", async () => {
    const { container } = render(<FxQuote payload={fxQuoteFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the dealer spread from the validated payload", () => {
    render(<FxQuote payload={fxQuoteFixtures.valid} />);
    expect(screen.getByText(/12 bps/i)).toBeTruthy();
  });
});
