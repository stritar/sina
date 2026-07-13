import { createMDX } from "fumadocs-mdx/next";
import { docsRedirects } from "./redirects.mjs";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Framework-native redirects — next-on-pages compiles these into the worker,
  // which is the only redirect mechanism that works on this site (see
  // redirects.mjs for why public/_redirects does not).
  async redirects() {
    return docsRedirects;
  },
  // Resolution of these packages still follows each one's `exports` map → `dist/`
  // (transpilePackages does NOT redirect the entry to `src`), so their `dist/`
  // must be built before `next build` — see the `prebuild` script in package.json.
  // transpilePackages only lets Next transpile that resolved `dist` output under
  // its own compiler.
  transpilePackages: [
    "@sina-design-system/core",
    "@sina-design-system/theme",
    "@sina-design-system/fintech",
    "@sina-design-system/fintech-react",
    "@sina-design-system/governance",
    "@sina-design-system/governance-demo",
  ],
};

// fumadocs-mdx webpack plugin: wires `content/docs` MDX + generates `.source`.
const withMDX = createMDX();

export default withMDX(nextConfig);
