import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { activityFeedFixtures } from "@sina-design-system/fintech";

import { ActivityFeed } from "./ActivityFeed.js";

describe("ActivityFeed", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<ActivityFeed payload={activityFeedFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<ActivityFeed payload={activityFeedFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders an activity title from the valid fixture", () => {
    render(<ActivityFeed payload={activityFeedFixtures.valid} />);
    expect(screen.getByText(/New sign-in from San Francisco/i)).toBeTruthy();
  });
});
