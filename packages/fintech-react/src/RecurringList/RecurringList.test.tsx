import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { recurringFixtures } from "@sina-design-system/fintech";

import { RecurringList } from "./RecurringList.js";

describe("RecurringList", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<RecurringList payload={recurringFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty payload", async () => {
    const { container } = render(<RecurringList payload={recurringFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known merchant from the valid fixture", () => {
    render(<RecurringList payload={recurringFixtures.valid} />);
    expect(screen.getByText("Netflix")).toBeTruthy();
  });
});
