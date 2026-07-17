"use client";

import { Badge } from "@sina-design-system/core";
import { INDUSTRIES, hero } from "./copy";
import { useIndustry } from "./IndustryContext";

/**
 * The hero's "Coming soon" tag for industries whose constitution has not
 * shipped. A static status Badge, never a button. The aria-live wrapper is
 * rendered permanently so the announcement fires when the tag appears.
 */
export function ComingSoonBadge() {
  const { industry } = useIndustry();
  const live = INDUSTRIES[industry].live;

  return (
    <span aria-live="polite">
      {live ? null : (
        <Badge intent="neutral" size="sm">
          {hero.comingSoon}
        </Badge>
      )}
    </span>
  );
}
