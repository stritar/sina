/**
 * Shared ESLint flat-config preset for the SINA monorepo (ESLint 9).
 * Consume from a workspace `eslint.config.mjs` via:
 *   import sina from "@sina-design-system/config/eslint";
 *   export default sina;
 */
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const globals = require("globals");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  { ignores: ["dist/**", ".next/**", "node_modules/**", "next-env.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
