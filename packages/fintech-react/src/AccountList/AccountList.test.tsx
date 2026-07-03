import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { accountListFixtures } from "@sina-design-system/fintech";

import { AccountList } from "./AccountList.js";

describe("AccountList", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<AccountList payload={accountListFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty fixture", async () => {
    const { container } = render(<AccountList payload={accountListFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known account name from the valid fixture", () => {
    render(<AccountList payload={accountListFixtures.valid} />);
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
  });
});
