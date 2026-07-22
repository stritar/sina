import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { searchResultsFixtures } from "@sina-design-system/fintech";

import { SearchResults } from "./SearchResults.js";

describe("SearchResults", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<SearchResults payload={searchResultsFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<SearchResults payload={searchResultsFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known result label from the valid fixture", () => {
    render(<SearchResults payload={searchResultsFixtures.valid} />);
    expect(screen.getByText(/Blue Bottle Coffee/i)).toBeTruthy();
  });
});
