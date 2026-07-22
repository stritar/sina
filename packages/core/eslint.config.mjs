import sina from "@sina-design-system/config/eslint";

/**
 * Boundary rule: `core` is headless and domain-agnostic. It knows nothing about
 * $50,000 limits or NSNs. Forbid the validation/domain layer (zod) and the
 * governance packages so business rules can never leak into a primitive.
 *
 * NOTE: this catches importing a domain package, not domain *vocabulary*
 * (a hand-rolled "currency" type with no import). The lexical check is deferred
 * to the Phase 0.5 boundary-guard hook.
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
              message: "core is domain-agnostic — validation/schemas belong in fintech/defense.",
            },
            {
              name: "@sina-design-system/fintech",
              message: "core must not depend on a governance domain.",
            },
          ],
          patterns: [
            {
              group: ["@sina-design-system/defense", "@sina-design-system/defense/*"],
              message: "core must not depend on a governance domain.",
            },
          ],
        },
      ],
    },
  },
];
