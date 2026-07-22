/**
 * Every reader-facing string on the landing page, in one dash-free surface.
 *
 * English only for the wireframe pass (the localized home routes temporarily
 * render this copy); the fidelity pass moves it into the i18n message catalogs.
 * The docs-prose guard walks this file, so em/en dashes are build failures here.
 */

export type Industry = "fintech" | "healthcare" | "defense";

export const NPM_ORG_URL = "https://www.npmjs.com/org/sina-design-system";

export const LINKEDIN_URL = "https://www.linkedin.com/in/denisstritar/";

export const nav = {
  wordmark: "SINA",
  docs: "Docs",
  npm: "npm",
  skip: "Skip to content",
} as const;

export const hero = {
  title: "AI agents will render anything. Yours shouldn't.",
  subhead:
    "SINA is a React design system with a server-side gate. Your agent proposes UI as intent, a Zod constitution decides what is allowed, and only governed components mount.",
  ctaDocs: "Read the docs",
  switcherLabel: "Pick an industry",
  comingSoon: "Coming soon",
} as const;

export interface IndustryDefinition {
  name: string;
  /** Live = runs the real server-side gate; otherwise a canned browser simulation. */
  live: boolean;
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
    packages: packagesFor("fintech"),
  },
  healthcare: {
    name: "Healthcare",
    live: false,
    packages: packagesFor("healthcare"),
  },
  defense: {
    name: "Defense",
    live: false,
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
      body: " The model never writes JSX and never picks what renders. It emits intent: a component name plus structured props, like a bank transfer with an amount and two accounts.",
    },
    {
      title: "The constitution checks it",
      body: "The rulebook is Zod running on your server, before anything streams to the client. Strict schemas reject unknown keys; policy rules check limits, approvals, and privacy.",
    },
    {
      title: "Mount, swap, or block",
      body: "A clean pass mounts the component. A risky request gets the governed version forced in its place, like a bank transfer dialog that demands a second approval. A bad one never renders, and every decision cites the rule it applied.",
    },
  ],
  codeHeading: "What a rule looks like",
  codeFilename: "wire-transfer.ts",
} as const;

export const why = {
  heading: "Why SINA",
  cards: [
    {
      badge: "Product teams",
      title: "Governance you can prove",
      body: "When someone asks why the interface blocked a transfer, the answer is a rule id and an audit event, not a screenshot and a guess. Every decision cites the rule it enforced.",
    },
    {
      badge: "Designers",
      title: "The blocked state is designed",
      body: "Rejection is part of the interface: a keyboard-operable component that names the rule, not an error page. Every primitive passes automated axe checks in the build.",
    },
    {
      badge: "Engineers",
      title: "No new runtime to trust",
      body: "React, Zod, five npm packages, MIT licensed. The gate is a function on your server. If SINA disappeared tomorrow, your components would still render.",
    },
  ],
} as const;

export const pitch = {
  heading: "In ten seconds",
  statement:
    "Letting an agent generate UI means trusting it with what renders. SINA removes that trust from the agent: it can only propose, a server-side constitution decides, and a refusal mounts a governed component instead of failing. Fintech is live today; healthcare and defense are next.",
  coda: "Free and MIT licensed, so the safety layer is not the reason a small team skips governance.",
  ctaDocs: "Read the docs",
  /**
   * The license + attribution line, which used to be its own footer bar. Figma
   * 247:2454 folds it into this band's right column, under the brand mark, so
   * the sheet closes on a ruled tail instead of an opaque bar. The mark carries
   * "SINA", so the line itself does not name it.
   */
  license: "MIT licensed. Built in the open.",
  madeBy: "Made by ",
  author: "Denis Stritar",
} as const;
