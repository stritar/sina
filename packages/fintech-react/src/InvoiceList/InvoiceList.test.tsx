import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { invoiceFixtures } from "@sina-design-system/fintech";

import { InvoiceList } from "./InvoiceList.js";

describe("InvoiceList", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<InvoiceList payload={invoiceFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty state", async () => {
    const { container } = render(<InvoiceList payload={invoiceFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders an invoice number from the validated payload", () => {
    render(<InvoiceList payload={invoiceFixtures.valid} />);
    expect(screen.getByText("INV-1001")).toBeTruthy();
  });
});
