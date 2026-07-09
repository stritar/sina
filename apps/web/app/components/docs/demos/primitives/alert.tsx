"use client";

import { Alert, Stack } from "@sina-design-system/core";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Alert demos for /docs/primitives/alert. Ported from the playground
 * story (apps/playground/app/primitives/alert/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

const VARIANTS = [
  { variant: "info", title: "Heads up", body: "Informational context for the current step." },
  { variant: "success", title: "All set", body: "The action completed successfully." },
  { variant: "warning", title: "Requires review", body: "Take a second look before proceeding." },
  { variant: "danger", title: "Blocked", body: "This was stopped and announced assertively." },
] as const;

export function AlertHero() {
  return (
    <Hero>
      <Alert variant="warning" title="Approval required">
        This transfer needs a second approver before it can proceed.
      </Alert>
    </Hero>
  );
}

export function AlertExamples() {
  return (
    <>
      <Example
        label="Variants · icon + title + description, never color alone"
        code={`<Alert variant="info" title="Heads up">Informational context for the current step.</Alert>
<Alert variant="success" title="All set">The action completed successfully.</Alert>
<Alert variant="warning" title="Requires review">Take a second look before proceeding.</Alert>
<Alert variant="danger" title="Blocked">This was stopped and announced assertively.</Alert>`}
      >
        <Stack gap={3}>
          {VARIANTS.map((v) => (
            <Alert key={v.variant} variant={v.variant} title={v.title}>
              {v.body}
            </Alert>
          ))}
        </Stack>
      </Example>

      <Example
        label="Icon override · custom glyph / hidden (icon={false})"
        code={`<Alert variant="info" title="Custom icon" icon={Sparkle}>
  Pass a Phosphor glyph to override the default intent icon.
</Alert>
<Alert variant="info" title="No icon" icon={false}>
  Pass icon={false} to omit the leading glyph entirely.
</Alert>`}
      >
        <Stack gap={3}>
          <Alert variant="info" title="Custom icon" icon={Sparkle}>
            Pass a Phosphor glyph to override the default intent icon.
          </Alert>
          <Alert variant="info" title="No icon" icon={false}>
            Pass icon={"{false}"} to omit the leading glyph entirely.
          </Alert>
        </Stack>
      </Example>

      <Example
        label="Content shapes · title-only / description-only"
        code={`<Alert variant="success" title="Title only" />
<Alert variant="warning">Description only, with no heading line.</Alert>`}
      >
        <Stack gap={3}>
          <Alert variant="success" title="Title only" />
          <Alert variant="warning">Description only, with no heading line.</Alert>
        </Stack>
      </Example>

      <StorySource slug="alert" />
    </>
  );
}
