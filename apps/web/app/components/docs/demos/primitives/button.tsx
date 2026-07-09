"use client";

import { Button, type ButtonProps } from "@sina-design-system/core";
import { ArrowRight, Plus, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Example, Hero, Matrix, StorySource } from "../shell";

/**
 * Live Button demos for /docs/primitives/button. Ported from the playground
 * story (apps/playground/app/primitives/button/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

const VARIANTS = ["primary", "secondary", "danger", "ghost"] as const;
const SIZES = ["sm", "md", "lg", "xl"] as const;
const STATES = [
  { key: "default", label: "default" },
  { key: "loading", label: "loading" },
  { key: "disabled", label: "disabled" },
] as const;

export function ButtonHero() {
  return (
    <Hero>
      <Button variant="primary" iconLeft={<ShieldCheck weight="fill" />}>
        Approve transfer
      </Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost" iconRight={<ArrowRight weight="bold" />}>
        Details
      </Button>
    </Hero>
  );
}

export function ButtonExamples() {
  return (
    <>
      <Example
        label="Variants"
        code={`<Button variant="primary">primary</Button>
<Button variant="secondary">secondary</Button>
<Button variant="danger">danger</Button>
<Button variant="ghost">ghost</Button>`}
      >
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Example>

      <Example
        label="Sizes"
        code={`<Button size="sm">sm</Button>
<Button size="md">md</Button>
<Button size="lg">lg</Button>
<Button size="xl">xl</Button>`}
      >
        {SIZES.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </Example>

      <Example
        label="Icons · left, right, icon-only"
        code={`<Button iconLeft={<ShieldCheck weight="fill" />}>Leading</Button>
<Button variant="secondary" iconRight={<ArrowRight weight="bold" />}>Trailing</Button>
<Button aria-label="Add item" iconLeft={<Plus weight="bold" />} />`}
      >
        <Button iconLeft={<ShieldCheck weight="fill" />}>Leading</Button>
        <Button variant="secondary" iconRight={<ArrowRight weight="bold" />}>
          Trailing
        </Button>
        <Button aria-label="Add item" iconLeft={<Plus weight="bold" />} />
      </Example>

      <Example
        label="Loading & asChild"
        code={`<Button loading>Sending…</Button>
<Button asChild>
  <a href="/docs">As link</a>
</Button>`}
      >
        <Button loading>Sending…</Button>
        <Button asChild>
          <a href="/docs">As link</a>
        </Button>
      </Example>

      <Matrix
        label="variant × state"
        rows={VARIANTS.map((v) => ({ key: v, label: v }))}
        cols={STATES.map((s) => ({ key: s.key, label: s.label }))}
        render={(variant, state) => (
          <Button
            variant={variant as ButtonProps["variant"]}
            loading={state === "loading"}
            disabled={state === "disabled"}
          >
            Go
          </Button>
        )}
      />

      <Matrix
        label="variant × size"
        rows={VARIANTS.map((v) => ({ key: v, label: v }))}
        cols={SIZES.map((s) => ({ key: s, label: s }))}
        render={(variant, size) => (
          <Button variant={variant as ButtonProps["variant"]} size={size as ButtonProps["size"]}>
            Go
          </Button>
        )}
      />

      <StorySource slug="button" />
    </>
  );
}
