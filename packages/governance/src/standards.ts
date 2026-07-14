/**
 * The standards catalog — the shape an industry constitution uses to declare
 * which real-world standards its rules encode, and the coverage check that keeps
 * that declaration honest.
 *
 * Domain-agnostic: this module owns the *type* and the *check*; the fintech (and
 * any future) package owns the *data*. A catalog is only trustworthy if it is
 * bound to the code both ways — a `standard:` citation a schema emits at runtime
 * must appear in the catalog, and a catalog entry must cite something the code
 * really checks. {@link uncataloguedCitations} and {@link uncitedStandards} are
 * the two halves of that bind; an industry's guard test walks its own `src` and
 * feeds the citations it finds to these.
 */

/**
 * How binding a standard is.
 *
 * - `format` — a structural/checksum standard (ISO 4217, IBAN mod-97, Luhn).
 * - `regulatory` — a real regulation or supervisory rule. Not yours to loosen.
 * - `policy` — a tunable SINA product default (dual control, step-up). **Not law.**
 */
export type StandardTier = "format" | "regulatory" | "policy";

/** One standard an industry constitution encodes. */
export interface Standard {
  /** Stable slug, e.g. `"iso-13616"`. */
  id: string;
  /** How the standard is named in the citation, e.g. `"ISO 13616"`, `"31 CFR 1010.311"`. */
  name: string;
  /** Who issues it, e.g. `"ISO"`, `"FinCEN"`, `"FATF"`, `"SINA"`. */
  authority: string;
  /** What the standard is about, in plain words, e.g. `"IBAN structure"`. */
  title: string;
  tier: StandardTier;
  /**
   * What the code **actually** checks — the honesty field. Describe the real
   * mechanism ("IBAN mod-97 checksum", "amount band, USD only", "field-name
   * deny-list + audit redaction"), never a compliance claim ("PCI compliant").
   * This is what a reader is trusting; an overstatement here is the whole bug.
   */
  enforcement: string;
  /**
   * The exact citation strings this entry covers — the `standard:` values its
   * rules emit, and/or the citation tags on the constants in `thresholds.ts`.
   * At least one must appear verbatim in the package's source, or the entry is
   * aspirational and the guard fails.
   */
  citations: string[];
  /** The modules or intents that enforce it, e.g. `["wire_transfer", "ach_transfer"]`. */
  where: string[];
  url?: string;
}

/**
 * Catalog entries that cite nothing the source really contains — a documented
 * standard with no enforcement behind it. These are the dangerous ones: a reader
 * takes the page as a compliance claim.
 *
 * `sourceText` is the package's own source, concatenated. A `format` standard is
 * cited in a Zod message or an `@see` comment (`"ISO 13616"` in `formats/iban.ts`)
 * rather than in a runtime `standard:` value, so the check is a substring search
 * over the source — not membership in {@link uncataloguedCitations}' list.
 */
export function uncitedStandards(catalog: readonly Standard[], sourceText: string): Standard[] {
  return catalog.filter((entry) => !entry.citations.some((cite) => sourceText.includes(cite)));
}

/**
 * Citations the code emits at runtime that no catalog entry covers — a rule
 * citing a standard the docs never list. The reverse leak: enforcement nobody can
 * see. `emitted` is every `standard:` value the package's rules carry.
 */
export function uncataloguedCitations(
  catalog: readonly Standard[],
  emitted: readonly string[],
): string[] {
  const covered = catalog.flatMap((entry) => entry.citations);
  return emitted.filter((found) => !covered.some((cite) => found.includes(cite)));
}
