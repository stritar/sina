/**
 * Redirects for moved docs URLs — the single source of truth.
 *
 * Consumed by `next.config.mjs` (`redirects()`), so next-on-pages compiles the
 * rules into the worker's route manifest — the ONLY way a redirect fires on
 * Cloudflare Pages for this site. A `public/_redirects` file does NOT work
 * here: next-on-pages' `_routes.json` sends every path through the worker, and
 * Cloudflare never applies `_redirects` to worker-handled requests (the Phase
 * 8.5 rules 404'd in production for this exact reason).
 *
 * Also consumed by `content/docs-links.test.ts`, which asserts every target is
 * a live page and no rule loops or shadows one. Cloudflare/Next don't chain
 * redirects for you — always point at the final URL.
 *
 * `:path*` is Next's catch-all syntax (the `_redirects` splat equivalent).
 */
export const docsRedirects = [
  // --- Pre-8.5 legacy URLs (flattened to the consolidated pages) ---
  { source: "/docs/getting-started/the-one-invariant", destination: "/docs/how-it-works" },
  { source: "/docs/concepts/interception-contract", destination: "/docs/concepts/the-contract" },
  { source: "/docs/concepts/threat-model", destination: "/docs/governance" },
  { source: "/docs/concepts/modes", destination: "/docs/agents" },
  { source: "/docs/architecture/package-boundaries", destination: "/docs/reference/packages" },
  { source: "/docs/architecture/:path*", destination: "/docs/how-it-works" },
  { source: "/docs/components", destination: "/docs/primitives" },
  { source: "/docs/guides/adversarial-test", destination: "/docs/guides/extend-sina" },

  // --- Getting started (merged into the intro / root pages) ---
  { source: "/docs/getting-started/why-sina", destination: "/docs" },
  { source: "/docs/getting-started/how-sina-works", destination: "/docs/how-it-works" },
  { source: "/docs/getting-started/quickstart", destination: "/docs/quickstart" },
  { source: "/docs/getting-started/choose-your-path", destination: "/docs" },
  { source: "/docs/getting-started/:path*", destination: "/docs" },

  // --- Concepts (7 pages merged into 3 + how-it-works) ---
  { source: "/docs/concepts/the-one-invariant", destination: "/docs/how-it-works" },
  { source: "/docs/concepts/intent-and-the-constitution", destination: "/docs/how-it-works" },
  { source: "/docs/concepts/how-interception-works", destination: "/docs/how-it-works" },
  { source: "/docs/concepts/the-interception-contract", destination: "/docs/concepts/the-contract" },
  { source: "/docs/concepts/validation", destination: "/docs/concepts/the-contract" },
  { source: "/docs/concepts/escalation-and-enforcement", destination: "/docs/concepts/escalation" },
  { source: "/docs/concepts/the-audit-trail", destination: "/docs/concepts/audit-trail" },

  // --- AI section (merged into /docs/agents) ---
  { source: "/docs/ai", destination: "/docs/agents" },
  { source: "/docs/ai/:path*", destination: "/docs/agents" },

  // --- Governance (security folded into the index; standards is a live page again) ---
  { source: "/docs/governance/security", destination: "/docs/governance" },
  { source: "/docs/governance/governed-components", destination: "/docs/governance/components-and-patterns" },
  { source: "/docs/governance/display-patterns", destination: "/docs/governance/components-and-patterns" },

  // --- Tokens (folded into Theming) ---
  { source: "/docs/tokens", destination: "/docs/theming/tokens" },
  { source: "/docs/tokens/:path*", destination: "/docs/theming/tokens" },

  // --- Theming ---
  { source: "/docs/theming/brand-and-the-locked-boundary", destination: "/docs/theming" },

  // --- Guides (9 → 2) ---
  { source: "/docs/guides/render-your-first-governed-component", destination: "/docs/quickstart" },
  { source: "/docs/guides/block-an-over-limit-action", destination: "/docs/governance/writing-a-rule" },
  { source: "/docs/guides/add-a-schema", destination: "/docs/governance/writing-a-rule" },
  { source: "/docs/guides/primitives-without-governance", destination: "/docs/guides/adopt-incrementally" },
  { source: "/docs/guides/theme-the-primitives", destination: "/docs/theming" },
  { source: "/docs/guides/add-a-primitive", destination: "/docs/guides/extend-sina" },
  { source: "/docs/guides/add-a-governed-domain", destination: "/docs/guides/extend-sina" },
  { source: "/docs/guides/write-an-adversarial-test", destination: "/docs/guides/extend-sina" },

  // --- Reference (9 → 3) ---
  { source: "/docs/reference/theme", destination: "/docs/theming/tokens" },
  { source: "/docs/reference/core", destination: "/docs/primitives" },
  { source: "/docs/reference/fintech", destination: "/docs/governance/components-and-patterns" },
  { source: "/docs/reference/governance", destination: "/docs/reference/packages" },
  { source: "/docs/reference/intent-registry", destination: "/docs/governance/components-and-patterns" },
  { source: "/docs/reference/docs-for-agents", destination: "/docs/agents" },
  { source: "/docs/reference/faq", destination: "/docs/reference/glossary" },
].map((rule) => ({ ...rule, permanent: true }));
