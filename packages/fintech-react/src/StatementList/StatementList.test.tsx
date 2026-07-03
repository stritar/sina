import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { statementListFixtures } from "@sina-design-system/fintech";

import { StatementList } from "./StatementList.js";

describe("StatementList", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<StatementList payload={statementListFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty state", async () => {
    const { container } = render(<StatementList payload={statementListFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a known value from the valid fixture", () => {
    render(<StatementList payload={statementListFixtures.valid} />);
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
  });
});
