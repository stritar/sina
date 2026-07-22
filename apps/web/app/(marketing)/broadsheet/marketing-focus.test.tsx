import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { render } from "@testing-library/react";
import { REGISTRY } from "./registry";
import type { Control, ControlValues } from "./types";

/**
 * Guard for the CLAUDE.md rule: "Marketing components inherit one global blue
 * focus outline."
 *
 * The blue outline is assigned by a single [data-broadsheet]:focus-visible rule
 * in broadsheet.css; every registered component must carry the marker, and no
 * component module may author its own focus style. Recipe: /marketing-focus-outline.
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const BROADSHEET_CSS = readFileSync(join(DIR, "broadsheet.css"), "utf8");

function defaults(controls: readonly Control[]): ControlValues {
  const values: ControlValues = {};
  for (const control of controls) values[control.key] = control.default;
  return values;
}

describe("marketing focus outline", () => {
  it("broadsheet.css defines the blue focus-ring token", () => {
    expect(BROADSHEET_CSS).toMatch(/--sinamk-color-focus-ring:\s*#2563eb/);
  });

  it("one [data-broadsheet]:focus-visible rule assigns the outline", () => {
    const rule = BROADSHEET_CSS.match(/\[data-broadsheet\]:focus-visible\s*\{([^}]*)\}/);
    expect(rule).not.toBeNull();
    const body = rule?.[1] ?? "";
    expect(body).toMatch(/outline/);
    expect(body).toMatch(/var\(\s*--sinamk-color-focus-ring/);
  });

  it("every registered component root carries data-broadsheet", () => {
    const missing = REGISTRY.filter((spec) => {
      const { container, unmount } = render(<>{spec.render(defaults(spec.controls))}</>);
      const ok = container.querySelector("[data-broadsheet]") !== null;
      unmount();
      return !ok;
    }).map((spec) => spec.id);
    expect(missing).toEqual([]);
  });

  it("no component module authors its own :focus-visible", () => {
    const offenders = readdirSync(DIR)
      .filter((file) => file.endsWith(".module.css"))
      .filter((file) => /:focus-visible/.test(readFileSync(join(DIR, file), "utf8")));
    expect(offenders).toEqual([]);
  });
});
