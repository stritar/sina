/**
 * @sina-design-system/core — error/warning-icon guard
 *
 * Enforces the CLAUDE.md rule "Error/warning states carry a bold status glyph":
 * every surface that conveys an error or warning state must render a bold Phosphor
 * glyph beside the text, so meaning never rides on fill + text alone. This guard
 * renders each such surface in its error/warning state and fails if no `svg`
 * glyph is present. When you add a new error/warning surface, add it here.
 *
 * Recipe: /error-warning-icon. The reference implementations are Alert.tsx
 * (VARIANTS map) and Toast.tsx (TOAST_ICONS map).
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Alert } from "./Alert/Alert.js";
import { Badge } from "./Badge/Badge.js";
import { Field } from "./Field/Field.js";
import { Toast } from "./Toast/Toast.js";
import { ToastProvider, ToastViewport } from "./Toast/Toast.js";

// Each case renders a component in an error/warning state. The invariant: a
// bold status glyph (`<svg>`) is present. Add a row when you ship a new such surface.
const CASES: Array<{ name: string; node: ReactElement }> = [
  { name: "Badge intent=danger", node: <Badge intent="danger">Blocked</Badge> },
  { name: "Badge intent=warning", node: <Badge intent="warning">Review</Badge> },
  {
    name: "Field error",
    node: (
      <Field label="Amount" error="Over the limit">
        <input />
      </Field>
    ),
  },
  { name: "Alert variant=warning", node: <Alert variant="warning">Heads up</Alert> },
  { name: "Alert variant=danger", node: <Alert variant="danger">Denied</Alert> },
  {
    name: "Toast variant=danger",
    node: (
      <ToastProvider>
        <Toast variant="danger">Rejected</Toast>
        <ToastViewport />
      </ToastProvider>
    ),
  },
];

describe("error/warning states carry a filled icon", () => {
  it.each(CASES)("$name renders a filled glyph", ({ node }) => {
    const { container } = render(node);
    const svg = container.querySelector("svg");
    expect(svg, "expected a bold error/warning glyph (<svg>) in this state").not.toBeNull();
    // The glyph is decorative — the text carries the meaning.
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});

// A badge's leading glyph must inherit the badge's label color — never carry its
// own. Phosphor renders `fill="currentColor"` when no `color` prop is passed
// (Badge passes none), so the glyph resolves to the same inherited text color as
// the label. See CLAUDE.md "all icons in badges inherit the label color".
describe("badge icons inherit the label color", () => {
  it("leading icon uses currentColor (no independent color)", () => {
    const { container } = render(
      <Badge intent="success" icon={ShieldCheck}>
        Governed
      </Badge>,
    );
    const svg = container.querySelector("svg");
    expect(svg, "expected a leading glyph (<svg>)").not.toBeNull();
    expect(svg?.getAttribute("fill")).toBe("currentColor");
  });
});
