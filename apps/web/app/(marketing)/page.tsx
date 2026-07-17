import type { Metadata } from "next";
import { MarketingHome } from "./MarketingHome";

const TITLE = "SINA: the governed design system for AI agents";
const DESCRIPTION =
  "Your AI agent proposes the interface. A server side constitution validates it, then an accessible React component mounts. Try the live fintech gate demo.";

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
  return <MarketingHome locale="en" />;
}
