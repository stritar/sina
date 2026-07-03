import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { transactionDetailFixtures } from "@sina-design-system/fintech";

import { TransactionDetail } from "./TransactionDetail.js";

describe("TransactionDetail", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(
      <TransactionDetail payload={transactionDetailFixtures.valid} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the minimal payload", async () => {
    const { container } = render(
      <TransactionDetail payload={transactionDetailFixtures.validEmpty} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known value from the valid fixture", () => {
    const { container } = render(
      <TransactionDetail payload={transactionDetailFixtures.valid} />,
    );
    expect(container.textContent).toContain("Acme SaaS Inc.");
  });
});
