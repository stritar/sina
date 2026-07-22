/**
 * Agent-only rules for the DSDS catalog (`agentDocumentBlocks`).
 *
 * These restate SINA's binding governance rules (CLAUDE.md; each is backed by a
 * vitest guard in the repo) as DSDS guideline entries with RFC 2119 levels, so
 * an agent consuming the catalog gets the same constraints the codebase
 * enforces. Keep entries in sync with the rules they cite; never add a rule
 * here that no guard enforces.
 */

/** Applies to every component entity: the §1b invariant. */
export const GLOBAL_RULES = [
  {
    guidance:
      "Emit intent plus props only, never a component or markup. The server validates the payload against the constitution before any component mounts (validate, then mount); client-side checks are untrusted UX sugar.",
    level: "must",
    rationale:
      "RSC tokens already streamed cannot be un-rendered, so the schema gate sits before the mount.",
  },
];

/** The status elements: Alert, Toast, Badge. */
const STATUS_NESTING_RULE = {
  guidance:
    "Never render a status element (Alert, Toast, Badge) inside another status element. Compose them as siblings: a text-only Alert with any severity Badges in a sibling row beneath it.",
  level: "must-not",
  rationale:
    "A status element communicates one self-contained intent. Enforced by the status-nesting build guard; each status root carries a data-sina-status marker.",
};

/** Components whose error/warning states carry the mandatory bold glyph. */
const STATUS_GLYPH_RULE = {
  guidance:
    "Error and warning states render a bold Phosphor status glyph beside the text (Warning for warning, WarningOctagon for error/danger; Info and CheckCircle for info/success). A caller may swap the glyph but never remove it.",
  level: "must",
  rationale:
    "Color fill plus text alone fails non-color perception; enforced by the error-warning-icon build guard.",
};

/** Extra per-component agent rules, keyed by docs slug. */
export const COMPONENT_RULES = {
  alert: [STATUS_NESTING_RULE, STATUS_GLYPH_RULE],
  toast: [STATUS_NESTING_RULE, STATUS_GLYPH_RULE],
  badge: [STATUS_NESTING_RULE, STATUS_GLYPH_RULE],
};

/** Applies to every pattern entity. */
export const PATTERN_RULES = (descriptor) => [
  {
    guidance:
      descriptor.kind === "governed"
        ? `Emit the "${descriptor.intent}" intent with props matching its schema; the server-side constitution decides whether it renders, escalates to ${descriptor.component}, or blocks. Never render ${descriptor.component} directly.`
        : `Emit the "${descriptor.intent}" intent with props matching its schema; on a clean server-side pass the router mounts ${descriptor.component}.`,
    level: "must",
  },
];
