/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@sina-design-system/core",
    "@sina-design-system/theme",
    "@sina-design-system/fintech",
    "@sina-design-system/fintech-react",
    "@sina-design-system/governance",
    "@sina-design-system/governance-demo",
  ],
};

export default nextConfig;
