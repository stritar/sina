import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Alert } from "./Alert.js";

describe("Alert", () => {
  it("renders every intent without axe violations", async () => {
    const { container } = render(
      <div>
        <Alert variant="info" title="Heads up">
          Informational message.
        </Alert>
        <Alert variant="success" title="Done">
          It worked.
        </Alert>
        <Alert variant="warning" title="Careful">
          Double-check this.
        </Alert>
        <Alert variant="danger" title="Blocked">
          This action was stopped.
        </Alert>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses an assertive role for danger and a polite role otherwise", () => {
    const { rerender } = render(<Alert variant="danger">Blocked</Alert>);
    expect(screen.getByRole("alert")).toBeDefined();

    rerender(<Alert variant="info">Note</Alert>);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("conveys meaning beyond color with an icon", () => {
    const { container } = render(<Alert variant="success">Saved</Alert>);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
