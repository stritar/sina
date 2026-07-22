import sina from "@sina-design-system/config/eslint";

/**
 * Boundary rule: `theme` ships design tokens and the Tailwind preset only — no React.
 * Enforced by tooling so a stray UI import surfaces at lint time, not review time.
 */
export default [
  ...sina,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "theme ships no React — tokens/preset only." },
            { name: "react-dom", message: "theme ships no React — tokens/preset only." },
          ],
          patterns: ["react/*", "react-dom/*"],
        },
      ],
    },
  },
];
