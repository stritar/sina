/**
 * @sina-design-system/core — charts/use-chart-theme (internal)
 *
 * Canvas charts read token values at render time, so a theme flip (the `.dark`
 * class or `data-theme` attribute on <html>) must trigger a re-read. This hook
 * returns a version counter that bumps on those mutations; chart components put
 * it in their options `useMemo` deps.
 */

"use client";

import { useEffect, useState } from "react";

export function useChartTheme(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return version;
}
