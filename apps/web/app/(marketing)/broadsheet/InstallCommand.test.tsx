import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { InstallCommand } from "./InstallCommand";

/**
 * Regression guard: the cursor-following "click to copy" tooltip must fade out
 * IN PLACE on mouse-out, not snap to its static top-left anchor.
 *
 * The bug: onMouseLeave cleared the cursor `coords` in the SAME event that hid
 * the tooltip. Only opacity/visibility transition (120ms) — not position — so the
 * still-fading tooltip teleported from the cursor to the CSS default anchor
 * (`left: 16px`, top of the card) and faded out there (the top-left flash). The
 * fix keeps the inline coords on mouse-out; on the next hover, onMouseEnter
 * re-tracks the cursor, so the stale value never shows.
 */
describe("InstallCommand tooltip", () => {
  it("keeps its cursor position on mouse-out so it fades in place, not at the anchor", () => {
    const { container } = render(<InstallCommand packages={["@sina/core"]} />);
    const button = container.querySelector("button")!;
    const tooltip = container.querySelector<HTMLElement>('[role="tooltip"]')!;

    // Hover: the tooltip opens and follows the cursor via an inline left/top.
    // (jsdom getBoundingClientRect() is all-zeros, so coords ≈ the clientX/Y.)
    fireEvent.mouseEnter(button, { clientX: 120, clientY: 40 });
    expect(tooltip.getAttribute("data-open")).toBe("true");
    expect(tooltip.style.left).not.toBe("");

    // Move out: the tooltip hides, but its inline position MUST persist so the
    // fade plays where the cursor last was — no reset to the static anchor.
    fireEvent.mouseLeave(button);
    expect(tooltip.getAttribute("data-open")).toBeNull();
    expect(tooltip.style.left).not.toBe("");
  });
});
