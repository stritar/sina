import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { AlertHero } from "@/app/components/docs/demos/primitives/alert";

/**
 * Guard for the docs "prose reset boundary".
 *
 * Live primitive demos render inside the MDX `.prose` body, whose bare element
 * selectors (`.prose p`, `.prose ul`, `.prose li` at 0,1,1) outrank a
 * primitive's own single-class rules (0,1,0) and the layered theme reset. The
 * tell was Alert: its title <p> picked up a 16px `.prose p` margin, which shoved
 * the text off the top-aligned icon. The demo shell tags each preview surface
 * with `data-demo-surface`, and `page.module.css` restores the reset baseline
 * inside it (see the "Prose reset boundary" block).
 *
 * jsdom maps CSS-module classes by name but does NOT cascade them
 * (vitest.config.ts `classNameStrategy: "non-scoped"`), so `getComputedStyle`
 * cannot measure the neutralized margin. These assertions are therefore
 * structural — the marker actually reaches the element the leak hit — plus a
 * static guard that the neutralizing rule exists and targets the right
 * properties. Together they lock the mechanism without a browser.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(HERE, "..", "..", "..", "..");
const PAGE_CSS = readFileSync(join(WEB_ROOT, "app", "docs", "page.module.css"), "utf8");
const SHELL_TSX = readFileSync(join(HERE, "shell.tsx"), "utf8");

describe("docs prose reset boundary", () => {
  it("marks the demo preview surface that encloses a primitive", () => {
    // Reproduce the docs DOM: the demo renders inside the MDX `.prose` body.
    const { container } = render(
      <div className="prose">
        <AlertHero />
      </div>,
    );

    // The Hero wrapper (styles.hero → "hero" under non-scoped) carries the marker…
    const hero = container.querySelector(".hero");
    expect(hero).not.toBeNull();
    expect(hero!.hasAttribute("data-demo-surface")).toBe(true);

    // …and the Alert title — the <p> `.prose p`'s margin clobbered — sits under it,
    // so the boundary's `[data-demo-surface] p { margin: 0 }` neutralizes it.
    // Query by tag, not the CSS-module class: the primitive is imported from built
    // dist, whose class names are hashed (`_title_…`), unlike the source shell's
    // non-scoped names — so we anchor on the title's text instead.
    const title = container.querySelector("[data-demo-surface] p");
    expect(title).not.toBeNull();
    expect(title!.textContent).toContain("Approval required");
  });

  it("restores the reset baseline inside the marked surface (page.module.css)", () => {
    expect(PAGE_CSS).toMatch(/\.prose \[data-demo-surface\]/);
    // Scope the property checks to the boundary block, not the whole stylesheet.
    const boundary = PAGE_CSS.slice(PAGE_CSS.indexOf(".prose [data-demo-surface]"));
    expect(boundary).toMatch(/margin: 0/);
    expect(boundary).toMatch(/padding-left: 0/);
    expect(boundary).toMatch(/list-style: none/);
    expect(boundary).toMatch(/line-height: var\(--sina-leading--normal\)/);
  });

  it("tags the hero, demoStage, and matrix surfaces in the demo shell (shell.tsx)", () => {
    const marks = SHELL_TSX.match(/data-demo-surface/g) ?? [];
    // Hero + Demo demoStage + Matrix matrixScroll + Example demoStage.
    expect(marks.length).toBeGreaterThanOrEqual(4);
    expect(SHELL_TSX).toMatch(/className=\{styles\.hero\} data-demo-surface/);
    expect(SHELL_TSX).toMatch(/className=\{styles\.matrixScroll\} data-demo-surface/);
    expect(SHELL_TSX).toMatch(/className=\{styles\.demoStage\} data-demo-surface/);
  });
});
