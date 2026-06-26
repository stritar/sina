import sina from "@sina-design-system/config/eslint";

/**
 * Boundary rule: `fintech` is the constitution — pure Zod schemas, no UI.
 * Forbids React and any SINA UI package so domain logic can never reach for render.
 */
export default [
  ...sina,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "fintech ships no UI — Zod schemas only." },
            { name: "react-dom", message: "fintech ships no UI — Zod schemas only." },
            {
              name: "@sina-design-system/core",
              message: "fintech ships no UI — it must not depend on core primitives.",
            },
            {
              name: "@sina-design-system/theme",
              message: "fintech ships no UI — it must not depend on theme.",
            },
          ],
          patterns: ["react/*", "react-dom/*"],
        },
      ],
    },
  },
];
