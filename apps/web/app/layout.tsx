import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Rubik, IBM_Plex_Mono } from "next/font/google";
// SINA styles: reset (layered) → tokens → component CSS. App CSS (globals + CSS
// Modules) is unlayered and wins over the reset. See @layer contract in CLAUDE.md.
import "@sina-design-system/theme/reset.css";
import "@sina-design-system/theme/css";
import "@sina-design-system/core/styles.css";
import "@sina-design-system/fintech-react/styles.css";
import "@sina-design-system/governance-demo/styles.css";
import "./globals.css";

// Self-hosted via next/font; exposed as CSS variables the SINA font tokens map to.
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" });
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sinahub.app"),
  title: "SINA — The Design System for AI Agents",
  description: "Governed UI for LLM-generated interfaces.",
  // Every icon is declared explicitly and served from `public/` at a stable URL.
  // Do NOT move these back to the `app/icon.*` file convention: declaring ANY
  // `icons` key here overrides the convention wholesale, and the SVG + Apple icon
  // silently vanish from the <head> while favicon.ico keeps working — which looks
  // like nothing is wrong. Regenerate the files with scripts/generate-favicons.mjs.
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      // SVG first: browsers that understand it prefer it at every size. The .ico is
      // the legacy fallback, and what Safari uses. Both are the SAME plated artwork,
      // on purpose — see scripts/generate-favicons.mjs for why the set carries no
      // `prefers-color-scheme` variant.
      // The `?v=` query is a cache-buster: browsers cache favicons aggressively, so
      // an icon from an earlier build lingers in the tab until the URL changes. Bump
      // it here AND in public/site.webmanifest whenever an asset is regenerated.
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon.ico?v=3", sizes: "16x16 32x32 48x48" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg?v=3", color: "#353b31" }],
  },
};

// Tints the browser chrome on mobile (Android Chrome, iOS Safari) to match the
// page background in each theme, so the URL bar doesn't fight the site.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#21251e" },
  ],
};

// Applied before paint so the theme is correct on first render (no flash). Reads
// the persisted choice, else the OS preference; stamps `data-theme` on <html>.
// Anything that is not an explicit "light"/"dark" — unset, or the "system" the
// toggle writes when the user hands control back to the OS — resolves against
// `prefers-color-scheme`.
const themeInitScript = `(function(){try{var t=localStorage.getItem("sina-docs-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      // The landing's default industry, server-rendered so the tint is right on
      // first paint. IndustryProvider takes it over from here; every tint rule
      // also requires `body:has(.sina-wireframe)`, so this attribute is inert on
      // the docs and /showcase.
      data-industry="fintech"
      className={`${rubik.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
