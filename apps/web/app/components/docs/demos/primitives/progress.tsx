"use client";

import { Progress } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Progress demos for /docs/primitives/progress. Ported from the
 * playground story (apps/playground/app/primitives/progress/page.tsx) — keep
 * the two in step when the primitive's prop surface changes.
 */

const VALUES = [0, 25, 50, 75, 100] as const;

export function ProgressHero() {
  return (
    <Hero>
      <Progress value={62} label="Progress 62 percent" />
    </Hero>
  );
}

export function ProgressExamples() {
  return (
    <>
      <Example
        label="Determinate · 0 → 100"
        code={`<Progress value={0} label="Progress 0 percent" />
<Progress value={25} label="Progress 25 percent" />
<Progress value={50} label="Progress 50 percent" />
<Progress value={75} label="Progress 75 percent" />
<Progress value={100} label="Progress 100 percent" />`}
      >
        {VALUES.map((value) => (
          <Progress key={value} value={value} label={`Progress ${value} percent`} />
        ))}
      </Example>

      <Example
        label="Indeterminate · no value"
        code={`<Progress label="Loading" />`}
      >
        <Progress label="Loading" />
      </Example>

      <StorySource slug="progress" />
    </>
  );
}
