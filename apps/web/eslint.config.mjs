import sina from "@sina-design-system/config/eslint";

export default [
  // Generated / build output — never linted. `.source` is fumadocs-mdx codegen
  // (@ts-nocheck types); `.next`/`.vercel`/`.wrangler` are Next + next-on-pages +
  // wrangler build artifacts (present locally after a `build`/`pages:build`/`pages:preview`).
  { ignores: [".source/**", ".next/**", ".vercel/**", ".wrangler/**"] },
  ...sina,
];
