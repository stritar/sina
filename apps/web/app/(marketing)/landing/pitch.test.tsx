import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { pitch, LINKEDIN_URL } from "./copy";
import { Pitch } from "./Pitch";

describe("Pitch redesign", () => {
  it("renders the ruled grid with a single half-width divider", async () => {
    const { container } = render(<Pitch />);

    // Only the statement row draws the internal vertical. The heading row is
    // deliberately not `split`, so the divider stops at its horizontal rule
    // instead of crossing up into the heading band.
    expect(container.querySelectorAll('[class*="split"]')).toHaveLength(1);
    const [headingRow] = container.querySelectorAll('[class*="frame"]');
    expect(headingRow?.className).not.toContain("split");

    // The eyebrow is gone: the section now leads with a real h2, so it names
    // itself in the accessibility tree the way every sibling section does.
    expect(
      screen.getByRole("heading", { level: 2, name: pitch.heading }),
    ).toBeTruthy();
    expect(screen.getByText(pitch.statement)).toBeTruthy();
    expect(screen.getByText(pitch.coda)).toBeTruthy();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the docs CTA as a link that inherits the marketing focus ring", () => {
    render(<Pitch />);

    // An anchor, never a button: the Broadsheet `lg` anatomy is reproduced in
    // the module rather than nesting a ButtonPrimary inside the link.
    const cta = screen.getByRole("link", { name: pitch.ctaDocs });
    expect(cta.getAttribute("href")).toBe("/docs");
    // The marker is what earns the single global blue outline, so the component
    // never authors its own :focus-visible.
    expect(cta.hasAttribute("data-broadsheet")).toBe(true);
    // Figma 176:1248 gives the CTA a leading FileText glyph. It is decorative
    // (the label already names the destination), so it must stay out of the
    // accessible name — which `getByRole` above already proves.
    expect(cta.querySelector("svg")).not.toBeNull();
  });

  it("mounts the glyph field as a decorative backdrop in the right half", () => {
    const { container } = render(<Pitch />);

    // jsdom has no canvas context, so the field takes its documented no-op
    // path. What has to hold here is the structure it depends on: a decorative,
    // non-interactive canvas inside a positioned cell.
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("carries the brand mark and the attribution the footer used to hold", () => {
    const { container } = render(<Pitch />);

    // The mark is the symbol alone: SinaLogo's 0 0 77 32 viewBox cropped to the
    // leading 32 units, so there is no second asset to keep in sync.
    const logo = container.querySelector('svg[viewBox="0 0 32 32"]');
    expect(logo).not.toBeNull();

    expect(screen.getByText(pitch.license)).toBeTruthy();

    // Only the name is the link, and it points at LinkedIn. `data-broadsheet`
    // is what earns the ONE global blue outline; a component-authored
    // :focus-visible would be the regression.
    const author = screen.getByRole("link", { name: pitch.author });
    expect(author.getAttribute("href")).toBe(LINKEDIN_URL);
    expect(author.getAttribute("rel")).toBe("noreferrer");
    expect(author.hasAttribute("data-broadsheet")).toBe(true);
  });

  it("closes the sheet with an empty decorative tail row", () => {
    const { container } = render(<Pitch />);

    // The rails run 64px past the last rule and terminate (Figma y=362 to
    // y=426). It is `.frame`'s own borders doing that, so the row has no
    // content and must stay out of the accessibility tree.
    const frames = container.querySelectorAll('[class*="frame"]');
    const tail = frames[frames.length - 1];
    expect(tail?.className).toContain("tail");
    expect(tail?.getAttribute("aria-hidden")).toBe("true");
    expect(tail?.textContent).toBe("");
  });
});
