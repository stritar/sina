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
  title: "SINA — The Design System for AI Agents",
  description: "Governed UI for LLM-generated interfaces.",
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
