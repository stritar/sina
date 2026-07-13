import type { Metadata } from "next";
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
  title: "SINA Playground",
  description: "streamUI interception sandbox for adversarial LLM outputs.",
};

// Applied before paint so the theme is correct on first render (no flash of light
// for a dark user). Reads the persisted choice, else the OS preference; stamps the
// `.dark` class on <html>, which is what the SINA theme package keys off. Lives in
// the ROOT layout, so /primitives/* honors the saved theme too — not just the
// emulator, which is the only route that renders a toggle.
const themeInitScript = `(function(){try{var t=localStorage.getItem("sina-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
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
