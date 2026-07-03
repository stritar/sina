import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { alertsFeedFixtures } from "@sina-design-system/fintech";

import { AlertsFeed } from "./AlertsFeed.js";

describe("AlertsFeed", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<AlertsFeed payload={alertsFeedFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty state", async () => {
    const { container } = render(<AlertsFeed payload={alertsFeedFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known alert title from the valid fixture", () => {
    render(<AlertsFeed payload={alertsFeedFixtures.valid} />);
    expect(screen.getByText(/Unusual sign-in blocked/i)).toBeTruthy();
  });
});
