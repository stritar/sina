import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { uncataloguedCitations, uncitedStandards } from "@sina-design-system/governance";

import { FINTECH_STANDARDS } from "./standards.js";

/**
 * Guard for the CLAUDE.md rule: "Every industry documents the standards it encodes."
 *
 * A standards page is a compliance claim, so it must be bound to the code in BOTH
 * directions or it quietly becomes fiction:
 *
 *   - a `standard:` a rule emits but the catalog omits → enforcement nobody can see;
 *   - a catalog entry citing nothing the code does → a claim nothing backs. This is
 *     the real bug this guard was written for: the docs advertised a Nacha Same Day
 *     ACH ceiling while `ACH_SAMEDAY_MAX_MINOR` sat unimported and `ach-transfer`'s
 *     own doc comment promised a reject that did not exist.
 *
 * Recipe: /new-industry-standards.
 */
const SRC = dirname(fileURLToPath(import.meta.url));

/** The catalog can't be its own evidence — nor can the tests that assert on it. */
const EXCLUDE = /(^standards\.ts$|\.test\.ts$|^fixtures\.ts$)/;

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith(".ts") && !EXCLUDE.test(entry.name)) files.push(full);
  }
  return files;
}

const sources = walk(SRC).map((file) => readFileSync(file, "utf8"));

/** The whole constitution's source — where a `format` standard is cited (Zod message, `@see`). */
const sourceText = sources.join("\n");

/** Every citation the rules actually emit at runtime, on a Violation. */
const emitted = [
  ...new Set(
    sources.flatMap((source) =>
      [...source.matchAll(/standard:\s*"([^"]+)"/g)].map((match) => match[1]!),
    ),
  ),
].sort();

describe("fintech standards catalog", () => {
  it("has citations and entries to check (guard is not vacuous)", () => {
    expect(emitted.length).toBeGreaterThan(20);
    expect(FINTECH_STANDARDS.length).toBeGreaterThanOrEqual(10);
    expect(FINTECH_STANDARDS.map((s) => s.id)).toContain("fincen-ctr");
  });

  it("has a unique id per entry", () => {
    const ids = FINTECH_STANDARDS.map((s) => s.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  it("catalogs every standard the rules cite at runtime", () => {
    const orphans = uncataloguedCitations(FINTECH_STANDARDS, emitted);
    expect(
      orphans,
      `These rules cite a standard that packages/fintech/src/standards.ts does not list, so it ` +
        `never reaches the docs. Add an entry (with an honest \`enforcement\`) — see ` +
        `/new-industry-standards:\n${orphans.map((c) => `  ${c}`).join("\n")}`,
    ).toEqual([]);
  });

  it("cites something the code really checks, for every entry", () => {
    const aspirational = uncitedStandards(FINTECH_STANDARDS, sourceText);
    expect(
      aspirational,
      `These catalog entries cite nothing found anywhere in packages/fintech/src, so the docs ` +
        `claim a standard no rule enforces. Either implement the check (with the citation in the ` +
        `code) or delete the entry — never document an aspiration:\n${aspirational
          .map((s) => `  ${s.id} (${s.citations.join(", ")})`)
          .join("\n")}`,
    ).toEqual([]);
  });

  it("describes an actual mechanism in `enforcement`, not a compliance claim", () => {
    // "compliant"/"certified" is how a standards page starts lying. Say what the code does.
    const overclaiming = FINTECH_STANDARDS.filter((s) =>
      /\b(compliant|compliance|certified|guarantees?)\b/i.test(s.enforcement),
    ).map((s) => s.id);
    expect(
      overclaiming,
      `\`enforcement\` must describe what SINA actually checks ("IBAN mod-97 checksum", "amount ` +
        `band, USD only"), never a compliance claim ("PCI compliant"):\n${overclaiming
          .map((id) => `  ${id}`)
          .join("\n")}`,
    ).toEqual([]);
  });
});
