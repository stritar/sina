"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Industry } from "./copy";

/**
 * The one piece of landing state: which industry the visitor is exploring.
 * Written by the hero's segment selector, read by the coming-soon badge and
 * the hero emulator. Server-rendered sections pass through as `children`, so
 * only the consumers are client components.
 */
interface IndustryValue {
  industry: Industry;
  setIndustry: (industry: Industry) => void;
}

const IndustryContext = createContext<IndustryValue>({
  industry: "fintech",
  setIndustry: () => {},
});

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [industry, setIndustry] = useState<Industry>("fintech");

  /**
   * Mirror the choice onto <html> so the page can absorb the industry tint.
   * It goes on the document element, not this provider's subtree, for the same
   * two reasons `data-theme` does: the tint scope is `body:has(.sina-wireframe)`
   * (so Radix portals follow), and the glyph field's canvas watches
   * documentElement attributes to know when to re-read its palette.
   *
   * layout.tsx server-renders `data-industry="fintech"`, so this effect only
   * ever CHANGES the value and never causes an untinted first paint.
   */
  useEffect(() => {
    document.documentElement.dataset.industry = industry;
  }, [industry]);

  return (
    <IndustryContext.Provider value={{ industry, setIndustry }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry(): IndustryValue {
  return useContext(IndustryContext);
}
