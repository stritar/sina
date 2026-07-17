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
    "Your agent proposes the interface. A server side rulebook, called a constitution, checks every request before anything renders. What passes mounts as a real, accessible component. What fails is blocked, escalated, or logged.",
  ctaDemo: "Try the demo",
  ctaDocs: "Read the docs",
  switcherLabel: "Pick an industry",
  comingSoon: "Coming soon",
} as const;

export interface IndustryDefinition {
  name: string;
  /** Live = runs the real server-side gate; otherwise a canned browser simulation. */
  live: boolean;
  /** The persona scenario: where SINA comes in for this industry. */
  narrative: string;
  /** Short mode tag shown beside the scenario and on the gate stage. */
  modeTag: string;
}

export const INDUSTRIES: Record<Industry, IndustryDefinition> = {
  fintech: {
    name: "Fintech",
    live: true,
    narrative:
      'An assistant inside a business banking app takes requests like "wire sixty thousand dollars to our supplier". The model drafts the interface, but bank policy decides what ships. Every verdict below comes from the same real gate endpoint the docs run.',
    modeTag: "Live demo",
  },
  healthcare: {
    name: "Healthcare",
    live: false,
    narrative:
      "A clinical assistant helps a nurse pull up charts and order medication. Privacy law says show the minimum necessary, and high risk orders need a pharmacist to co-sign. This preview is simulated in your browser: no healthcare constitution ships yet.",
    modeTag: "Simulated preview",
  },
  defense: {
    name: "Defense",
    live: false,
    narrative:
      "A logistics assistant answers questions about shipments and transfer orders. Some rows are export controlled, and moving munitions takes two people, never one. This preview is simulated in your browser: no defense constitution ships yet.",
    modeTag: "Simulated preview",
  },
};

export const emulator = {
  heading: "Watch the gate decide",
  sub: "Pick a request, run the gate, and see what actually reaches the user.",
  scenarioKicker: "The scenario",
  pickLabel: "Pick a request",
  run: "Run the gate",
  running: "Running",
  retry: "Try again",
  stages: {
    intent: "1. Agent emits intent",
    gate: "2. The gate",
    verdict: "3. Verdict",
  },
  intentUserLabel: "User",
  intentAgentLabel: "The agent proposes, as structured data:",
  showJson: "Show the full intent JSON",
  gateLive: "Runs on the real gate endpoint.",
  gateSimulated: "Simulated preview. Runs in your browser.",
  gateIdle: "The constitution waits on the server. Nothing renders until it decides.",
  gateChecking: "Checking with the constitution",
  gateEmitting: "Streaming intent",
  latency: "gate latency",
  latencySimulated: "simulated",
  gateVerdict: {
    pass: "Pass",
    escalate: "Escalate",
    reject: "Block",
  },
  expected: {
    pass: "passes",
    escalate: "escalates",
    reject: "blocked",
  },
  verdictIdle: "Run the gate to see what mounts.",
  verdictPass: "Mounted",
  verdictEscalate: "Escalated: approval required",
  verdictReject: "Blocked",
  verdictPassNote: "The payload was valid, so SINA mounted the real component.",
  verdictEscalateNote:
    "SINA blocked the raw render and forced the governed component in its place. This is where a second approver signs.",
  verdictRejectNote: "SINA blocked the raw render. The payload violated the constitution.",
  escalateDocsLink: "See the full approval loop in the docs",
  violationsHeading: "Violations",
  noViolations: "No violations.",
  transportTitle: "Could not reach the gate",
  transportBody:
    "This is a network problem, not a governance decision. The constitution never said no; we could not ask it. Try again.",
  withheldRow: "Row withheld. Logged.",
  approveSketch: "Approve",
  denySketch: "Deny",
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
