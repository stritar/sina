import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fintechIntentManifest } from "@sina-design-system/fintech";

import { CONTENT_ROOT } from "./docs-test-helpers";

/**
 * Guard: the docs' intent table can never silently drift from the shipped
 * registry again (an integration review found the table listing ~24 of 49
 * verbs with nothing telling the reader the real surface was bigger).
 *
 * Two binds, both against `fintechIntentManifest()` (the registry's own
 * model-facing surface):
 *   - every verb the table names must exist in the manifest (no stale rows);
 *   - the page must state the manifest's TRUE total, so the table may stay an
 *     exemplar list but the count a reader takes away is always correct.
 */
const PAGE = "docs/governance/components-and-patterns.mdx";
const source = readFileSync(join(CONTENT_ROOT, "governance/components-and-patterns.mdx"), "utf8");
const manifest = fintechIntentManifest();
const registered = new Set(manifest.map((entry) => entry.intent));

/** The intent-registry section only (the package catalog's tables use other vocab). */
const section = source.split(/^## The intent registry$/m)[1]?.split(/^## /m)[0] ?? "";

/** Every backticked snake_case token in the section's table rows. */
const tableVerbs = [
  ...new Set(
    section
      .split("\n")
      .filter((line) => line.startsWith("|"))
      .flatMap((line) => [...line.matchAll(/`([a-z][a-z0-9_]*)`/g)].map((m) => m[1]!)),
  ),
];

describe("docs intent table — bound to the registry", () => {
  it("has verbs to check (guard is not vacuous)", () => {
    expect(tableVerbs.length).toBeGreaterThan(10);
    expect(registered.size).toBeGreaterThan(40);
  });

  it(`names only verbs the registry ships (${PAGE})`, () => {
    const stale = tableVerbs.filter((verb) => !registered.has(verb));
    expect(
      stale,
      `These intent-table rows name verbs fintechIntentManifest() does not ship — ` +
        `remove or fix the rows:\n${stale.map((v) => `  ${v}`).join("\n")}`,
    ).toEqual([]);
  });

  it("states the registry's true verb count in prose", () => {
    const claim = source.match(/registry has (\d+) verbs/);
    expect(
      claim,
      `${PAGE} must state the registry's total ("the shipped registry has <n> verbs") ` +
        `so the table can stay an exemplar list without under-selling the surface.`,
    ).not.toBeNull();
    expect(
      Number(claim![1]),
      `${PAGE} says the registry has ${claim![1]} verbs but fintechIntentManifest() ` +
        `ships ${registered.size} — update the number in prose.`,
    ).toBe(registered.size);
  });
});
