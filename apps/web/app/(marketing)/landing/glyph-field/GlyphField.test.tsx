import { describe, expect, it } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { axe } from "jest-axe";
import { GlyphField } from "./GlyphField";

// jsdom has neither a WebGL2 nor a 2D canvas context, so the effect takes the
// no-op fallback path (no GPU renderer, no RAF, no listeners). The component must
// still mount a decorative, non-interactive canvas without throwing — the
// SSR/test-safe contract the background relies on, now that the GPU path exists.

describe("GlyphField", () => {
  it("renders an aria-hidden, non-interactive canvas without throwing", async () => {
    const { container } = render(<GlyphField />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();

    const wrapper = canvas!.parentElement;
    expect(wrapper?.getAttribute("aria-hidden")).toBe("true");

    // Decorative + aria-hidden → nothing for axe to flag.
    expect(await axe(container)).toHaveNoViolations();
  });

  it("mounts and unmounts cleanly when no WebGL/2D context is available", () => {
    // Guards the fallback branch + listener teardown: no throw on the full
    // mount→unmount cycle even when every canvas context is missing (jsdom).
    expect(() => {
      const { unmount } = render(<GlyphField />);
      unmount();
    }).not.toThrow();
    cleanup();
  });
});
