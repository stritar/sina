import { createMDX } from "fumadocs-mdx/next";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile SINA workspace packages from source rather than requiring a prebuild.
  transpilePackages: [
    "@sina-design-system/core",
    "@sina-design-system/theme",
    "@sina-design-system/fintech",
    "@sina-design-system/governance",
    "@sina-design-system/governance-demo",
  ],
};

// fumadocs-mdx webpack plugin: wires `content/docs` MDX + generates `.source`.
const withMDX = createMDX();

export default withMDX(nextConfig);
