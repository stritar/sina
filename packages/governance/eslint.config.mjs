import sina from "@sina-design-system/config/eslint";

/**
 * Boundary rule: `governance` is the domain-agnostic seam — the interception
 * contract, audit emit, and Zod engine shared by every constitution. It must
 * stay free of UI *and* of any single domain: forbid React, the UI packages,
 * and the domain packages (`fintech`/`defense`). `zod` IS allowed — the engine
 * wraps a `ZodType`. Domain vocabulary (limits, IBANs, component names) lives
 * in the domain packages, not here.
 */
export default [
  ...sina,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "governance ships no UI — contract + engine only." },
            { name: "react-dom", message: "governance ships no UI — contract + engine only." },
            {
              name: "@sina-design-system/core",
              message: "governance is domain-agnostic — it must not depend on UI primitives.",
            },
            {
              name: "@sina-design-system/theme",
              message: "governance is domain-agnostic — it must not depend on theme.",
            },
            {
              name: "@sina-design-system/fintech",
              message: "the shared seam must not depend on a domain — domains depend on it.",
            },
          ],
          patterns: [
            {
              group: ["react/*", "react-dom/*"],
              message: "governance ships no UI — contract + engine only.",
            },
            {
              group: ["@sina-design-system/defense", "@sina-design-system/defense/*"],
              message: "the shared seam must not depend on a domain — domains depend on it.",
            },
          ],
        },
      ],
    },
  },
];
