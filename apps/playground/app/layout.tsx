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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${ibmPlexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
