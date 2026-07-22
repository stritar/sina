"use client";

import { Badge, SummaryList } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live SummaryList demos for /docs/primitives/summary-list. Ported from the
 * playground story (apps/playground/app/primitives/summary-list/page.tsx) —
 * keep the two in step when the primitive's prop surface changes.
 */

export function SummaryListHero() {
  return (
    <Hero>
      <SummaryList
        items={[
          { label: "Amount", value: "$60,000.00", emphasis: true },
          { label: "To", value: "Beta LLC · ****4821" },
          { label: "Rail", value: "Wire" },
          { label: "Reference", value: "INV-2041" },
        ]}
      />
    </Hero>
  );
}

export function SummaryListExamples() {
  return (
    <>
      <Example
        label="Key/value rows"
        code={`<SummaryList
  items={[
    { label: "Account", value: "Operating · ****4821" },
    { label: "Owner", value: "Treasury team" },
    { label: "Opened", value: "Jun 27 · 09:14" },
    { label: "Region", value: "North" },
  ]}
/>`}
      >
        <SummaryList
          items={[
            { label: "Account", value: "Operating · ****4821" },
            { label: "Owner", value: "Treasury team" },
            { label: "Opened", value: "Jun 27 · 09:14" },
            { label: "Region", value: "North" },
          ]}
        />
      </Example>

      <Example
        label="Emphasis · totals"
        code={`<SummaryList
  items={[
    { label: "Subtotal", value: "$58,500.00" },
    { label: "Wire fee", value: "$25.00" },
    { label: "Total", value: "$58,525.00", emphasis: true },
  ]}
/>`}
      >
        <SummaryList
          items={[
            { label: "Subtotal", value: "$58,500.00" },
            { label: "Wire fee", value: "$25.00" },
            { label: "Total", value: "$58,525.00", emphasis: true },
          ]}
        />
      </Example>

      <Example
        label="Rich values · any node"
        code={`<SummaryList
  items={[
    { label: "Beneficiary", value: "Beta LLC" },
    { label: "Status", value: <Badge intent="success">Verified</Badge> },
    {
      label: "Notes",
      value:
        "A longer descriptive value that exceeds the available width and wraps onto multiple lines within the row.",
    },
  ]}
/>`}
      >
        <SummaryList
          items={[
            { label: "Beneficiary", value: "Beta LLC" },
            { label: "Status", value: <Badge intent="success">Verified</Badge> },
            {
              label: "Notes",
              value:
                "A longer descriptive value that exceeds the available width and wraps onto multiple lines within the row.",
            },
          ]}
        />
      </Example>

      <StorySource slug="summary-list" />
    </>
  );
}
