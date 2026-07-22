/**
 * @sina-design-system/governance-demo — violation-row layout guard
 *
 * BlockedState is the canonical de-nested status pattern, so its violation head
 * has to match the governed dialogs: the severity Badge stacks ABOVE the message,
 * one column, never beside it. The fintech-react twin of this guard pins
 * SecureWireDialog and GovernedActionDialog.
 *
 * jsdom does not apply CSS Module declarations, so this reads the module text.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("BlockedState stacks the severity Badge above the message", () => {
  it(".violationHead is a column", () => {
    // Vitest runs with the package root as cwd; `import.meta.url` is an http:
    // URL under the jsdom environment, so it can't be resolved to a path.
    const css = readFileSync(resolve(process.cwd(), "src/BlockedState.module.css"), "utf8");
    const match = css.match(/\.violationHead\s*\{([^}]*)\}/);
    expect(match, "no `.violationHead` rule found").not.toBeNull();
    const block = match![1];

    expect(
      block,
      ".violationHead must set `flex-direction: column` — the severity Badge stacks above its message, never beside it",
    ).toMatch(/flex-direction:\s*column/);
    expect(block, ".violationHead must set `align-items: flex-start`").toMatch(
      /align-items:\s*flex-start/,
    );
  });
});
