import { afterEach, describe, expect, it, vi } from "vitest";
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

/**
 * The unreleased ("coming soon") state is a real interaction lockout, not just a
 * visual fade: the packages it names are not on the registry yet, so handing the
 * visitor a copyable `npm install` line would be actively misleading.
 */
describe("InstallCommand coming-soon state", () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubClipboard() {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    return writeText;
  }

  it("marks the command disabled and puts the message in the tooltip", () => {
    const { container } = render(
      <InstallCommand packages={["@sina-design-system/healthcare"]} comingSoon />,
    );

    const tooltip = container.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(tooltip.textContent).toBe("Coming soon");
    expect(tooltip.getAttribute("data-coming-soon")).toBe("true");
    expect(container.querySelector("button")!.getAttribute("aria-disabled")).toBe("true");
  });

  it("never writes to the clipboard on click", () => {
    const writeText = stubClipboard();
    const { container } = render(
      <InstallCommand packages={["@sina-design-system/healthcare"]} comingSoon />,
    );

    fireEvent.click(container.querySelector("button")!);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("still opens the tooltip on hover and focus — it IS the signal now", () => {
    const { container } = render(
      <InstallCommand packages={["@sina-design-system/healthcare"]} comingSoon />,
    );
    const button = container.querySelector("button")!;
    const tooltip = container.querySelector<HTMLElement>('[role="tooltip"]')!;

    fireEvent.mouseEnter(button, { clientX: 120, clientY: 40 });
    expect(tooltip.getAttribute("data-open")).toBe("true");
    expect(tooltip.textContent).toBe("Coming soon");

    fireEvent.mouseLeave(button);
    fireEvent.focus(button);
    expect(tooltip.getAttribute("data-open")).toBe("true");
  });

  it("never flips the tooltip to Copied! even after a click", () => {
    stubClipboard();
    const { container } = render(
      <InstallCommand packages={["@sina-design-system/healthcare"]} comingSoon />,
    );
    const button = container.querySelector("button")!;
    const tooltip = container.querySelector<HTMLElement>('[role="tooltip"]')!;

    fireEvent.click(button);
    expect(tooltip.textContent).toBe("Coming soon");
  });

  // The manager stays live even when the packages are not: switching npm/pnpm
  // rewrites the visible command, which is useful to read regardless of whether
  // it can be copied yet. Only the copy itself is locked out.
  it("leaves the package-manager dropdown active", () => {
    const { getByLabelText } = render(
      <InstallCommand packages={["@sina-design-system/healthcare"]} comingSoon />,
    );
    expect(getByLabelText("Package manager").hasAttribute("disabled")).toBe(false);
  });

  it("stays fully interactive when the packages have shipped", () => {
    const writeText = stubClipboard();
    const { container, queryByText } = render(
      <InstallCommand packages={["@sina-design-system/fintech"]} />,
    );

    expect(queryByText("Coming soon")).toBeNull();
    expect(container.querySelector("button")!.getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(container.querySelector("button")!);
    expect(writeText).toHaveBeenCalledOnce();
  });
});
