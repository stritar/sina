import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { REGISTRY } from "./registry";
import type { Control, ControlValues } from "./types";

/**
 * Auto-a11y gate for every registered Broadsheet component. Loops the registry
 * and runs jest-axe across a bounded variant matrix, so a new component added to
 * REGISTRY is accessibility-checked for free. Backs the "auto-axe every
 * component" scale decision.
 */
function defaults(controls: readonly Control[]): ControlValues {
  const values: ControlValues = {};
  for (const control of controls) values[control.key] = control.default;
  return values;
}

/** Each select option once, booleans forced on so icon slots render. */
function variants(controls: readonly Control[]): ControlValues[] {
  const base = defaults(controls);
  for (const control of controls) {
    if (control.type === "boolean") base[control.key] = true;
  }
  const out: ControlValues[] = [base];
  for (const control of controls) {
    if (control.type === "select") {
      for (const option of control.options) {
        if (option === base[control.key]) continue;
        out.push({ ...base, [control.key]: option });
      }
    }
  }
  return out;
}

describe("broadsheet components pass axe", () => {
  it.each(REGISTRY.map((spec) => [spec.id, spec] as const))(
    "%s has no a11y violations across variants",
    async (_id, spec) => {
      for (const values of variants(spec.controls)) {
        const { container, unmount } = render(<>{spec.render(values)}</>);
        expect(await axe(container)).toHaveNoViolations();
        unmount();
      }
    },
  );
});
