/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile SINA workspace packages from source rather than requiring a prebuild.
  transpilePackages: ["@sina-design-system/core", "@sina-design-system/theme"],
};

export default nextConfig;
