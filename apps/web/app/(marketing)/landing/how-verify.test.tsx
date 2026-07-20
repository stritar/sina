import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { how } from "./copy";
import { HowItWorks } from "./HowItWorks";

const EXPECTED_SOURCE = `const wireTransfer = z
  .object({
    amount: minorUnits,
    currency: iso4217,
    debtor: party,
    creditor: party,
  })
  .strict();

if (amount > usd(50_000)) {
  escalate("AMOUNT_REQUIRES_APPROVAL", "SecureWireDialog");
}
`;

describe("HowItWorks redesign", () => {
  it("renders the ruled grid with full-height column dividers", async () => {
    const { container } = render(<HowItWorks />);

    // Only the steps row draws the two internal verticals. The heading row is
    // deliberately not `ruled`, so the column dividers stop at its horizontal
    // rule instead of crossing up into the heading band.
    const ruled = container.querySelectorAll('[class*="ruled"]');
    expect(ruled).toHaveLength(1);
    const [headingRow] = container.querySelectorAll('[class*="frame"]');
    expect(headingRow.className).not.toContain("ruled");

    // No per-item border any more: one mechanism owns the verticals.
    for (const step of container.querySelectorAll("ol > li")) {
      expect(step.className).not.toContain("border");
    }

    expect(
      screen.getByRole("heading", { level: 2, name: how.heading }),
    ).toBeTruthy();
    expect(container.querySelectorAll("ol > li")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the code panel with numbered, syntax-tagged lines", () => {
    const { container } = render(<HowItWorks />);

    expect(screen.getByText(how.codeFilename)).toBeTruthy();

    // Twelve numbered lines, in order, including the blank one.
    const lines = [...container.querySelectorAll("[data-line]")];
    expect(lines.map((l) => l.getAttribute("data-line"))).toEqual(
      Array.from({ length: 12 }, (_, i) => String(i + 1)),
    );

    // Every syntax kind actually made it into the markup.
    const kinds = new Set(
      [...container.querySelectorAll("[data-t]")].map((n) =>
        n.getAttribute("data-t"),
      ),
    );
    expect([...kinds].sort()).toEqual([
      "fn",
      "kw",
      "num",
      "prop",
      "punct",
      "str",
      "type",
    ]);

    // The decisive tokens are coloured, not left as body text.
    const tagged = (kind: string) =>
      [...container.querySelectorAll(`[data-t="${kind}"]`)].map(
        (n) => n.textContent,
      );
    expect(tagged("num")).toEqual(["50_000"]);
    expect(tagged("fn")).toContain("escalate");
    expect(tagged("kw")).toEqual(["const", "if"]);

    // The tokenized render still reconstructs the exact original source, so the
    // line numbers (::before content) never enter a copied selection.
    expect(container.querySelector("pre code")?.textContent).toBe(
      EXPECTED_SOURCE,
    );
  });
});
