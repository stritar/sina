import type { Metadata } from "next";
import { MarketingHome } from "./MarketingHome";

const TITLE = "SINA: the governed design system for AI agents";
const DESCRIPTION =
  "AI agents that generate UI need limits. SINA validates every proposal against a server-side constitution before a React component mounts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "SINA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function HomePage() {
  return <MarketingHome />;
}
