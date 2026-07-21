import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { clarifyChoiceFixtures } from "@sina-design-system/fintech";

import { ClarifyChoice } from "./ClarifyChoice.js";

describe("ClarifyChoice", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(
      <ClarifyChoice payload={clarifyChoiceFixtures.validWhichAlex} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the prompt and one option per candidate", () => {
    render(<ClarifyChoice payload={clarifyChoiceFixtures.validWhichAlex} />);
    expect(screen.getByText("Which Alex do you mean?")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Alex Berger")).toBeTruthy();
  });

  it("emits the picked option as a selection hint (never an execution)", async () => {
    const onSelect = vi.fn();
    render(<ClarifyChoice payload={clarifyChoiceFixtures.validWhichAlex} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /Alex Chen/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: "payee_alex_chen", label: "Alex Chen" });
  });

  it("renders an empty state on a hostile/empty shape", () => {
    render(<ClarifyChoice payload={{}} />);
    expect(screen.getByText(/nothing to clarify/i)).toBeTruthy();
  });

  it("renders a label carrying markup as TEXT, never parsing it to HTML", () => {
    const { container } = render(
      <ClarifyChoice payload={clarifyChoiceFixtures.markupLabel} />,
    );
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(container.querySelector("img")).toBeNull();
  });
});
