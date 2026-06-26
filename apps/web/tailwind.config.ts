import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind loads this config via jiti; the preset is CommonJS, so require() is correct here.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require("@sina-design-system/theme/tailwind")],
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
