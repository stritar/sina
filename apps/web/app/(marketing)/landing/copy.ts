/**
 * Every reader-facing string on the landing page, in one dash-free surface.
 *
 * English only for the wireframe pass (the localized home routes temporarily
 * render this copy); the fidelity pass moves it into the i18n message catalogs.
 * The docs-prose guard walks this file, so em/en dashes are build failures here.
 */

export type Industry = "fintech" | "healthcare" | "defense";

export const NPM_ORG_URL = "https://www.npmjs.com/org/sina-design-system";

export const nav = {
  wordmark: "SINA",
  docs: "Docs",
  npm: "npm",
  skip: "Skip to content",
} as const;

export const hero = {
  eyebrow: "Open source. MIT licensed.",
  title: "The governed design system for AI agents",
  subhead:
    "Your AI proposes what the interface should do. SINA checks it against your product, compliance, and accessibility rules before anything reaches the user.",
  ctaDocs: "Read the docs",
  ctaHowItWorks: "How it works",
  switcherLabel: "Pick an industry",
  comingSoon: "Coming soon",
} as const;

export interface IndustryDefinition {
  name: string;
  /** Live = runs the real server-side gate; otherwise a canned browser simulation. */
  live: boolean;
  /** Short mode tag shown on the emulator header and gate stage. */
  modeTag: string;
  /** The packages an adopter installs for this industry, in install order. */
  packages: readonly string[];
}

/** Every industry installs the same shell around its own constitution pair. */
function packagesFor(industry: Industry): readonly string[] {
  return [
    "@sina-design-system/theme",
    "@sina-design-system/core",
    `@sina-design-system/${industry}`,
    `@sina-design-system/${industry}-react`,
    "@sina-design-system/governance",
  ] as const;
}

export const INDUSTRIES: Record<Industry, IndustryDefinition> = {
  fintech: {
    name: "Fintech",
    live: true,
    modeTag: "Live demo",
    packages: packagesFor("fintech"),
  },
  healthcare: {
    name: "Healthcare",
    live: false,
    modeTag: "Simulated preview",
    packages: packagesFor("healthcare"),
  },
  defense: {
    name: "Defense",
    live: false,
    modeTag: "Simulated preview",
    packages: packagesFor("defense"),
  },
};

/**
 * Strings for the hero conversation emulator: the auto-playing pass/block
 * thread in the hero's right column (the matured Diptych). The gate rides
 * inline in the conversation, so a completed turn stacks like a real messenger.
 */
export const heroEmulator = {
  heading: "Watch the gate decide",
  lede: "Two requests on a loop: one passes, one hits the constitution.",
  threadLabel: "Governed conversation",
  gateKicker: "The gate",
  checking: "Checking against the constitution",
  wireApproval: "Simulated approval. The real gate re-checks server-side.",
  simulatedCollects: "The dialog collects",
  simulatedCaption: "SINA would mount this component here.",
  wireApproved:
    "Approved. A second party signed off, the gate re-checked the same terms server-side, and the transfer is logged.",
  send: "Send",
  pause: "Pause the demo",
  play: "Play the demo",
  composerPlaceholder: "Ask the agent for something",
} as const;

export const how = {
  heading: "How it works",
  steps: [
    {
      title: "The agent emits intent",
      body: "Instead of raw HTML, the model asks for a component by name with structured data. It never picks what renders.",
    },
    {
      title: "The constitution checks it",
      body: "A rulebook written as code runs on your server. It validates the shape and the policy: limits, approvals, privacy.",
    },
    {
      title: "Mount or block",
      body: "A clean pass mounts a real component. A risky request gets the safe component forced in its place. A bad one is blocked. Every decision is logged.",
    },
  ],
  codeSummary: "Show what a rule looks like",
  codeCaption: "A trimmed sketch of the real wire transfer rule. The full version lives in the docs.",
} as const;

export const why = {
  heading: "Why teams pick SINA",
  cards: [
    {
      kicker: "For product teams",
      title: "Provable governance",
      body: "Every decision cites the rule it enforced and emits an audit event. You can show exactly why the interface did what it did.",
    },
    {
      kicker: "For designers",
      title: "Accessibility built in",
      body: "Every primitive ships with keyboard support, focus management, and contrast that passes automated checks. The blocked state is a designed moment, not an error page.",
    },
    {
      kicker: "For engineers",
      title: "Just React and Zod",
      body: "Five plain packages on npm, MIT licensed. The gate is a function you call on your server. No runtime lock-in.",
    },
  ],
} as const;

export const pitch = {
  eyebrow: "The whole idea, in ten seconds",
  statement:
    "SINA lets startups adopt AI generated UI without building the safety layer themselves. The agent proposes; a server side constitution decides; and when the answer is no, SINA doesn't just block, it mounts the governed version instead.",
  coda: "It's free, because the safety layer is the hard part, and startups shouldn't have to pay for the thing they most need.",
} as const;

export const finalCta = {
  heading: "Put a constitution between your agent and your users.",
  sub: "Free for startups and individuals. Install it, wire the gate, ship governed agentic UI.",
  docs: "Read the docs",
  npm: "View on npm",
  install: "npm install @sina-design-system/theme @sina-design-system/core",
} as const;

export const footer = {
  line: "SINA. MIT licensed. Built in the open.",
} as const;
