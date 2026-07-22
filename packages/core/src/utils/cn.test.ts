import { describe, expect, it } from "vitest";
import { cn } from "./cn.js";

describe("cn", () => {
  // Post-Tailwind, cn() is clsx: it concatenates CSS Module class names and
  // passthrough className, with no utility-conflict resolution (there are no
  // Tailwind utilities left to conflict). It just joins truthy class values.
  it("joins class names", () => {
    expect(cn("root", "primary")).toBe("root primary");
  });

  it("drops falsy values and honors conditionals", () => {
    const on = true;
    const off = false;
    expect(cn("root", false, undefined, null, "", "active")).toBe("root active");
    expect(cn("root", on && "on", off && "off")).toBe("root on");
  });

  it("keeps every provided class (no dedup/merge)", () => {
    expect(cn("gap-a", "gap-b")).toBe("gap-a gap-b");
  });
});
