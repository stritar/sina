/**
 * @sina-design-system/fintech-react — violation-row layout guard
 *
 * Every blocking violation renders its severity Badge STACKED ABOVE the message,
 * one column, never beside it: a severity token and a sentence are two different
 * things, and side-by-side squeezes the message into a narrow ragged block. The
 * two governed dialogs drifted apart once already (GovernedActionDialog stacked,
 * SecureWireDialog did not), so this pins both.
 *
 * jsdom does not apply CSS Module declarations, so a computed-style assertion
 * would pass vacuously — this reads the module text and checks the rule itself.
 * The governance-demo twin (`BlockedState.module.css` `.violationHead`) is guarded
 * by its own package-local test.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CASES = [
  { file: "src/SecureWireDialog/SecureWireDialog.module.css", rule: "violationRow" },
  { file: "src/GovernedActionDialog/GovernedActionDialog.module.css", rule: "violationRow" },
] as const;

function ruleBlock(css: string, rule: string): string {
  const match = css.match(new RegExp(`\\.${rule}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`no \`.${rule}\` rule found`);
  return match[1];
}

describe("violation rows stack the severity Badge above the message", () => {
  it.each(CASES)("$file .$rule is a column", ({ file, rule }) => {
    // Vitest runs with the package root as cwd; `import.meta.url` is an http:
    // URL under the jsdom environment, so it can't be resolved to a path.
    const css = readFileSync(resolve(process.cwd(), file), "utf8");
    const block = ruleBlock(css, rule);

    expect(
      block,
      `.${rule} must set \`flex-direction: column\` — the severity Badge stacks above its message, never beside it`,
    ).toMatch(/flex-direction:\s*column/);
    expect(block, `.${rule} must set \`align-items: flex-start\``).toMatch(
      /align-items:\s*flex-start/,
    );
  });
});
