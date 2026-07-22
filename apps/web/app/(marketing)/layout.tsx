import type { ReactNode } from "react";

/**
 * Marketing route group. Reserved for the Phase 9 bespoke landing so its layout
 * system stays isolated from the `/docs` segment (Phase 7). Neutral passthrough
 * for now — the scrollytelling landing lands here later.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
