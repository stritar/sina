import { describe, expect, it } from "vitest";
import { axe } from "jest-axe";

/**
 * Phase 0 smoke test: proves the jsdom + jest-axe harness runs in this package.
 * Uses a raw DOM fragment (no React render) so the a11y gate is provable on day one
 * without coupling Phase 0 to React 19 rendering. Real primitive tests land in Phase 2.
 */
describe("core a11y harness", () => {
  it("passes axe on accessible markup", async () => {
    const el = document.createElement("div");
    el.innerHTML = `<button type="button">Confirm transfer</button>`;
    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it("flags an a11y violation (proves axe is actually asserting)", async () => {
    const el = document.createElement("div");
    // Input with no accessible name — axe should report a violation.
    el.innerHTML = `<input type="text" />`;
    const results = await axe(el);
    expect(results.violations.length).toBeGreaterThan(0);
  });
});
