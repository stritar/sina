import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { walkDocs, CONTENT_ROOT } from "./docs-test-helpers";

/**
 * Guard for the CLAUDE.md rule: "One story, told once."
 *
 * The docs' canonical narrative assets each have exactly ONE home; every other
 * page links to that home instead of retelling the story with its own copy of
 * the diagram or live demo. This is what keeps the docs small: the moment a
 * second page embeds the hero flow diagram, it is re-explaining the mechanism.
 *
 * To move an asset's home (or deliberately add one), update the CANON row —
 * a visible, reviewable change. Recipe: /new-doc-page.
 */
const CANON: Array<{ marker: RegExp; name: string; allowed: string[] }> = [
  { marker: /<SameModelDiagram/, name: "SameModelDiagram", allowed: ["index.mdx"] },
  { marker: /<ArchitectureDiagram/, name: "ArchitectureDiagram", allowed: ["how-it-works.mdx"] },
  { marker: /<EnforcementLadder/, name: "EnforcementLadder", allowed: ["concepts/escalation.mdx"] },
  { marker: /<TokenTree/, name: "TokenTree", allowed: ["theming/tokens.mdx"] },
  {
    marker: /<StandardsTable/,
    name: "StandardsTable",
    allowed: ["governance/standards.mdx"],
  },
  {
    marker: /<GovernanceDemo/,
    name: "GovernanceDemo",
    allowed: ["agents.mdx", "governance/wire-transfer.mdx"],
  },
];

const pages = walkDocs();

describe("docs canon — one story, told once", () => {
  it("has pages to check (guard is not vacuous)", () => {
    expect(pages.length).toBeGreaterThan(20);
  });

  it.each(CANON)("$name appears only on its designated page(s)", ({ marker, allowed }) => {
    const offenders = pages
      .filter((file) => marker.test(readFileSync(file, "utf8")))
      .map((file) => relative(CONTENT_ROOT, file))
      .filter((rel) => !allowed.includes(rel));
    expect(offenders).toEqual([]);
  });

  it.each(CANON)("$name's designated home still uses it (no dead allowlist)", ({ marker, allowed }) => {
    const used = pages
      .map((file) => relative(CONTENT_ROOT, file))
      .filter((rel) => allowed.includes(rel));
    expect(used.length).toBeGreaterThan(0);
    for (const rel of used) {
      expect(marker.test(readFileSync(`${CONTENT_ROOT}/${rel}`, "utf8"))).toBe(true);
    }
  });
});
