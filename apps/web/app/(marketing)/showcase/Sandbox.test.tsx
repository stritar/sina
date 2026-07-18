import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sandbox } from "./Sandbox";

/**
 * Drives the registry-driven showcase: the default preview renders, switching
 * components swaps the preview and its controls, and a control (state) flows
 * through to the rendered component. Guards the sandbox wiring end to end.
 */
describe("Broadsheet showcase sandbox", () => {
  it("renders the default component preview", () => {
    render(<Sandbox />);
    expect(screen.getByRole("button", { name: "Button" })).toBeTruthy();
  });

  it("switches the previewed component and applies a control", async () => {
    const user = userEvent.setup();
    render(<Sandbox />);

    await user.click(screen.getByRole("radio", { name: "Button / Icon" }));
    const iconButton = screen.getByRole("button", { name: "Add item" });
    expect(iconButton.getAttribute("aria-busy")).toBeNull();

    await user.click(screen.getByRole("radio", { name: "loading" }));
    const loading = screen.getByRole("button", { name: "Add item" }) as HTMLButtonElement;
    expect(loading.getAttribute("aria-busy")).toBe("true");
    expect(loading.disabled).toBe(true);
  });
});
