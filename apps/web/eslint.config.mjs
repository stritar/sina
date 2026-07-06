import sina from "@sina-design-system/config/eslint";

export default [
  // fumadocs-mdx codegen output (@ts-nocheck, generated types) — not linted.
  { ignores: [".source/**"] },
  ...sina,
];
