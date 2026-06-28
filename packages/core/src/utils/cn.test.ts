import { describe, expect, it } from "vitest";
import { cn } from "./cn.js";

describe("cn", () => {
  // Regression: the theme's custom `text-ui` font-size token collided with the
  // `text-color` group in tailwind-merge's default config, silently dropping a
  // preceding `text-<color>` — which erased button label colors (invisible text
  // on filled variants). `ui` is now registered as a font-size.
  it("keeps a text color alongside the custom `text-ui` font-size", () => {
    expect(cn("text-primary-fg", "text-ui")).toBe("text-primary-fg text-ui");
  });

  it("still lets a later class win within a real conflict group", () => {
    expect(cn("px-1", "px-2")).toBe("px-2");
  });
});
