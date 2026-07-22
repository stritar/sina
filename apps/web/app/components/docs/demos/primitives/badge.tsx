"use client";

import { Badge, type BadgeProps } from "@sina-design-system/core";
import { CheckCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Example, Hero, Matrix, StorySource } from "../shell";

/**
 * Live Badge demos for /docs/primitives/badge. Ported from the playground
 * story (apps/playground/app/primitives/badge/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

const SIZES = ["md", "sm"] as const;
const INTENTS = ["danger", "success", "warning", "info", "neutral"] as const;

export function BadgeHero() {
  return (
    <Hero>
      <Badge intent="success" dot>
        Verified
      </Badge>
      <Badge intent="warning">Review</Badge>
      <Badge intent="danger">Blocked</Badge>
      <Badge intent="info" icon={ShieldCheck}>
        Governed
      </Badge>
      <Badge>Draft</Badge>
    </Hero>
  );
}

export function BadgeExamples() {
  return (
    <>
      <Example
        label="Mandatory glyph · danger / warning render a filled icon by default"
        code={`<Badge intent="danger">Blocked</Badge>
<Badge intent="warning">Review</Badge>`}
      >
        <Badge intent="danger">Blocked</Badge>
        <Badge intent="warning">Review</Badge>
      </Example>

      <Example
        label="Modifiers · dot / icon / dot sm"
        code={`<Badge intent="success" dot>Dot</Badge>
<Badge intent="info" icon={ShieldCheck}>Icon</Badge>
<Badge size="sm" intent="success" dot>Dot sm</Badge>`}
      >
        <Badge intent="success" dot>
          Dot
        </Badge>
        <Badge intent="info" icon={ShieldCheck}>
          Icon
        </Badge>
        <Badge size="sm" intent="success" dot>
          Dot sm
        </Badge>
      </Example>

      <Example
        label="Dismissible · trailing X via onClose + closeLabel"
        code={`<Badge intent="info" icon={CheckCircle} onClose={() => {}} closeLabel="Dismiss info">
  info
</Badge>`}
      >
        {INTENTS.map((intent) => (
          <Badge
            key={intent}
            intent={intent}
            icon={CheckCircle}
            onClose={() => {}}
            closeLabel={`Dismiss ${intent}`}
          >
            {intent}
          </Badge>
        ))}
      </Example>

      <Matrix
        label="size × intent"
        rows={SIZES.map((s) => ({ key: s, label: s }))}
        cols={INTENTS.map((i) => ({ key: i, label: i }))}
        render={(size, intent) => (
          <Badge size={size as BadgeProps["size"]} intent={intent as BadgeProps["intent"]}>
            {intent}
          </Badge>
        )}
      />

      <StorySource slug="badge" />
    </>
  );
}
