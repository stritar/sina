import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Spinner } from "./Spinner.js";

describe("Spinner", () => {
  it("exposes a status role with a screen-reader label and no axe violations", async () => {
    const { container } = render(<Spinner label="Validating" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Validating");
    expect(await axe(container)).toHaveNoViolations();
  });
});
