import type { Config } from "tailwindcss";

// NOTE: once @sina-design-system/theme exposes its preset, wire it here:
//   presets: [require("@sina-design-system/theme/tailwind")],
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/core/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
