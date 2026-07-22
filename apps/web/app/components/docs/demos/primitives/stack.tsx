"use client";

import { Badge, Button, Stack } from "@sina-design-system/core";
import { Example, Hero, Specimen, StorySource } from "../shell";

/**
 * Live Stack demos for /docs/primitives/stack. Ported from the playground
 * story (apps/playground/app/primitives/stack/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

const WRAP_TAGS = [
  "Wire",
  "ACH",
  "SEPA",
  "SWIFT",
  "Card",
  "Refund",
  "Payroll",
  "Invoice",
  "FX",
  "Escrow",
  "Treasury",
  "Ledger",
] as const;

export function StackHero() {
  return (
    <Hero>
      <Stack direction="row" gap={3} align="center">
        <Badge>Draft</Badge>
        <Badge intent="success">Approved</Badge>
        <Button size="sm" variant="secondary">
          Review
        </Button>
      </Stack>
    </Hero>
  );
}

export function StackExamples() {
  return (
    <>
      <Example
        label="Direction · row and col"
        code={`<Stack direction="row" gap={2}>
  <Badge>Wire</Badge>
  <Badge>ACH</Badge>
  <Badge>SEPA</Badge>
</Stack>

<Stack direction="col" gap={2} align="start">
  <Badge>Wire</Badge>
  <Badge>ACH</Badge>
  <Badge>SEPA</Badge>
</Stack>`}
      >
        <Specimen caption="row">
          <Stack direction="row" gap={2}>
            <Badge>Wire</Badge>
            <Badge>ACH</Badge>
            <Badge>SEPA</Badge>
          </Stack>
        </Specimen>
        <Specimen caption="col">
          <Stack direction="col" gap={2} align="start">
            <Badge>Wire</Badge>
            <Badge>ACH</Badge>
            <Badge>SEPA</Badge>
          </Stack>
        </Specimen>
      </Example>

      <Example
        label="Gap · on-system steps"
        code={`<Stack direction="row" gap={1}>…</Stack>
<Stack direction="row" gap={3}>…</Stack>
<Stack direction="row" gap={8}>…</Stack>`}
      >
        {([1, 3, 8] as const).map((gap) => (
          <Specimen key={gap} caption={`gap ${gap}`}>
            <Stack direction="row" gap={gap}>
              <Badge>A</Badge>
              <Badge>B</Badge>
              <Badge>C</Badge>
            </Stack>
          </Specimen>
        ))}
      </Example>

      <Example
        label="Align · cross-axis with mixed heights"
        code={`<Stack direction="row" gap={2} align="start">…</Stack>
<Stack direction="row" gap={2} align="center">…</Stack>
<Stack direction="row" gap={2} align="end">…</Stack>`}
      >
        {(["start", "center", "end"] as const).map((align) => (
          <Specimen key={align} caption={`align ${align}`}>
            <Stack direction="row" gap={2} align={align}>
              <Button size="sm" variant="secondary">
                sm
              </Button>
              <Button size="md" variant="secondary">
                md
              </Button>
              <Button size="xl" variant="secondary">
                xl
              </Button>
            </Stack>
          </Specimen>
        ))}
      </Example>

      <Example
        label="Wrap"
        code={`<Stack direction="row" gap={2} wrap>
  {tags.map((tag) => (
    <Badge key={tag}>{tag}</Badge>
  ))}
</Stack>`}
      >
        <Stack direction="row" gap={2} wrap>
          {WRAP_TAGS.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </Stack>
      </Example>

      <StorySource slug="stack" />
    </>
  );
}
