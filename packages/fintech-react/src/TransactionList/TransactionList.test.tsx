import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { transactionFixtures } from "@sina-design-system/fintech";

import { TransactionList } from "./TransactionList.js";

describe("TransactionList", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(
      <TransactionList payload={transactionFixtures.validTwoTransactions} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders one list item per transaction", () => {
    render(<TransactionList payload={transactionFixtures.validTwoTransactions} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByText(/XYZ Company/i)).toHaveLength(2);
  });

  it("renders an empty state when there are no transactions", () => {
    render(<TransactionList payload={transactionFixtures.validEmpty} />);
    expect(screen.getByText(/no transactions/i)).toBeTruthy();
  });

  it("renders a description carrying markup as TEXT, never parsing it to HTML", () => {
    const { container } = render(
      <TransactionList payload={transactionFixtures.injectedHtmlDescription} />,
    );
    // The raw string appears verbatim as text …
    expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
    // … and no <img> element was ever parsed from it.
    expect(container.querySelector("img")).toBeNull();
  });
});
