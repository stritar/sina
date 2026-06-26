import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Rubik, IBM_Plex_Mono } from "next/font/google";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${ibmPlexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
