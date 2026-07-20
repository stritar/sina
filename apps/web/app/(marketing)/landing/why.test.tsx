import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { why } from "./copy";
import { WhySina } from "./WhySina";

describe("WhySina redesign", () => {
  it("renders the ruled grid with full-height column dividers", async () => {
    const { container } = render(<WhySina />);

    // Only the cards row draws the two internal verticals. The heading row is
    // deliberately not `ruled`, so the column dividers stop at its horizontal
    // rule instead of crossing up into the heading band.
    expect(container.querySelectorAll('[class*="ruled"]')).toHaveLength(1);
    const [headingRow] = container.querySelectorAll('[class*="frame"]');
    expect(headingRow.className).not.toContain("ruled");

    // The old card chrome is gone: no per-item border, radius or fill. One
    // mechanism owns the dividing lines.
    for (const card of container.querySelectorAll("ul > li")) {
      expect(card.className).not.toContain("border");
    }

    expect(
      screen.getByRole("heading", { level: 2, name: why.heading }),
    ).toBeTruthy();
    expect(container.querySelectorAll("ul > li")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders each audience tab as real, readable content", () => {
    const { container } = render(<WhySina />);

    // The tab names the audience, so unlike the HowItWorks step numbers it must
    // reach the accessibility tree rather than being decorative.
    for (const card of why.cards) {
      const tab = screen.getByText(card.badge);
      expect(tab.closest("[aria-hidden]")).toBeNull();
      expect(
        screen.getByRole("heading", { level: 3, name: card.title }),
      ).toBeTruthy();
    }

    // One tone per card, in reading order, each resolved from a distinct
    // Broadsheet badge token rather than a raw colour.
    const tones = [...container.querySelectorAll("[data-tone]")].map((n) =>
      n.getAttribute("data-tone"),
    );
    expect(tones).toEqual(["blue", "violet", "pink"]);
  });
});
