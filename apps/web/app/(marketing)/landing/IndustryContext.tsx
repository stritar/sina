"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Industry } from "./copy";

/**
 * The one piece of landing state: which industry the visitor is exploring.
 * Written by the hero's IndustrySwitcher, read by the coming-soon badge, the
 * scenario narrative, and the emulator. Server-rendered sections pass through
 * as `children`, so only the consumers are client components.
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
  return (
    <IndustryContext.Provider value={{ industry, setIndustry }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry(): IndustryValue {
  return useContext(IndustryContext);
}
