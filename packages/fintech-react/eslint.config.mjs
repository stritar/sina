import sina from "@sina-design-system/config/eslint";

/**
 * Boundary rule: `fintech-react` is the governed-UI layer — the ONE package
 * allowed to import both `core` (primitives) and `fintech` (the constitution)
 * and marry them into a governed component. It still must NOT author schemas
 * (no `zod` — validation lives in `fintech`; this layer only composes the
 * result) and must NOT reach across verticals into `defense`.
 *
 * The gate stays server-side (§1b): these components render a decision that was
 * already made by the constitution — they never validate a payload themselves.
 */
export default [
  ...sina,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "zod",
              message:
                "fintech-react composes fintech's schemas — it must not author validation. Add the rule in fintech.",
            },
          ],
          patterns: [
            {
              group: ["@sina-design-system/defense", "@sina-design-system/defense/*"],
              message: "fintech-react is fintech-only — no cross-vertical imports.",
            },
          ],
        },
      ],
    },
  },
];
