"use client";

import { Icon } from "@sina-design-system/core";
import type { IconWeight } from "@phosphor-icons/react";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Example, Hero, Matrix, Specimen, StorySource } from "../shell";

/**
 * Live Icon demos for /docs/primitives/icon. Ported from the playground story
 * (apps/playground/app/primitives/icon/page.tsx) — keep the two in step when
 * the primitive's prop surface changes.
 */

const SIZES = ["16", "20", "24", "32"] as const;
const WEIGHTS = ["regular", "bold", "fill", "duotone"] as const;

export function IconHero() {
  return (
    <Hero>
      <Icon icon={ShieldCheck} label="Governed by SINA" size={32} />
      <Icon icon={ShieldCheck} decorative size={32} weight="bold" />
      <Icon icon={ShieldCheck} decorative size={32} weight="duotone" />
    </Hero>
  );
}

export function IconExamples() {
  return (
    <>
      <Example
        label="Labeled vs decorative"
        code={`<Icon icon={ShieldCheck} label="Secure" size={24} />   {/* announced */}
<Icon icon={ShieldCheck} decorative size={24} />       {/* silent */}`}
      >
        <Specimen caption="label — announced">
          <Icon icon={ShieldCheck} label="Secure" size={24} />
        </Specimen>
        <Specimen caption="decorative — silent">
          <Icon icon={ShieldCheck} decorative size={24} />
        </Specimen>
      </Example>

      <Example
        label="Sizes"
        code={`<Icon icon={ShieldCheck} decorative size={16} />
<Icon icon={ShieldCheck} decorative size={20} />
<Icon icon={ShieldCheck} decorative size={24} />
<Icon icon={ShieldCheck} decorative size={32} />`}
      >
        {SIZES.map((size) => (
          <Specimen key={size} caption={`${size}px`}>
            <Icon icon={ShieldCheck} decorative size={Number(size)} />
          </Specimen>
        ))}
      </Example>

      <Example
        label="Weights"
        code={`<Icon icon={ShieldCheck} decorative size={24} weight="regular" />
<Icon icon={ShieldCheck} decorative size={24} weight="bold" />
<Icon icon={ShieldCheck} decorative size={24} weight="fill" />
<Icon icon={ShieldCheck} decorative size={24} weight="duotone" />`}
      >
        {WEIGHTS.map((weight) => (
          <Specimen key={weight} caption={weight}>
            <Icon icon={ShieldCheck} decorative size={24} weight={weight as IconWeight} />
          </Specimen>
        ))}
      </Example>

      <Matrix
        label="size × weight"
        rows={SIZES.map((s) => ({ key: s, label: `${s}px` }))}
        cols={WEIGHTS.map((w) => ({ key: w, label: w }))}
        render={(size, weight) => (
          <Icon icon={ShieldCheck} size={Number(size)} weight={weight as IconWeight} decorative />
        )}
      />

      <StorySource slug="icon" />
    </>
  );
}
