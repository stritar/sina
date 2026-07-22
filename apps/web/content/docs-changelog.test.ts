import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guard for the CLAUDE.md rule: every release updates the changelog page.
 *
 * The five public packages version in lockstep (the Changesets `fixed` group),
 * so one number covers all of them. This guard reads that number straight from
 * the packages and fails the build when the hand-maintained docs changelog
 * (`reference/changelog.mdx`) does not name it in all three places a reader
 * looks: the "Current versions" summary line, the `pnpm add …@X.Y.Z` install
 * snippet, and a `## X.Y.Z` release section.
 *
 * This is the drift the rule exists to prevent: the page silently fell a release
 * behind once (it read 0.1.0 while the packages shipped 0.2.0).
 */

const HERE = dirname(fileURLToPath(import.meta.url)); // apps/web/content
const REPO_ROOT = join(HERE, "..", "..", ".."); // apps/web/content -> repo root

/** The five public packages, versioned together via the Changesets `fixed` group. */
const PUBLIC_PACKAGES = ["theme", "core", "governance", "fintech", "fintech-react"] as const;

function packageVersion(name: string): string {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "packages", name, "package.json"), "utf8"));
  return pkg.version as string;
}

const versions = PUBLIC_PACKAGES.map((name) => [name, packageVersion(name)] as const);
const version = packageVersion("core");
const changelog = readFileSync(join(HERE, "docs", "reference", "changelog.mdx"), "utf8");

describe("docs changelog is current", () => {
  it("checks all five public packages (guard is not vacuous)", () => {
    expect(PUBLIC_PACKAGES).toHaveLength(5);
  });

  it("the published version is semver-shaped", () => {
    expect(version, `unexpected version shape: ${version}`).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it.each(versions)("@sina-design-system/%s is in lockstep at the same version", (name, v) => {
    expect(v, `${name} is at ${v}, not ${version} — the fixed group drifted`).toBe(version);
  });

  it('names the version in the "Current versions" summary line', () => {
    expect(
      changelog,
      `changelog.mdx must read "published at **${version}**" — run /release-changelog`,
    ).toContain(`published at **${version}**`);
  });

  it("names the version in the install snippet", () => {
    expect(
      changelog,
      `changelog.mdx must install @sina-design-system/core@${version} — run /release-changelog`,
    ).toContain(`@sina-design-system/core@${version}`);
  });

  it(`has a "## ${version}" release section`, () => {
    const heading = new RegExp(`^## ${version.replace(/\./g, "\\.")}(:|\\s|$)`, "m");
    expect(
      heading.test(changelog),
      `changelog.mdx needs a "## ${version}: <name>" section — run /release-changelog`,
    ).toBe(true);
  });
});
