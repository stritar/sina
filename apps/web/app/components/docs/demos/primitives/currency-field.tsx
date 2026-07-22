"use client";

import { CurrencyField } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live CurrencyField demos for /docs/primitives/currency-field. Ported from
 * the playground story (apps/playground/app/primitives/currency-field/page.tsx)
 * — keep the two in step when the primitive's prop surface changes.
 */

export function CurrencyFieldHero() {
  return (
    <Hero>
      <CurrencyField
        label="Amount"
        description="Groups digits on blur"
        currencySymbol="$"
        defaultValue="25000"
      />
    </Hero>
  );
}

export function CurrencyFieldExamples() {
  return (
    <>
      <Example
        label="Symbols"
        code={`<CurrencyField label="Amount" currencySymbol="$" defaultValue="25000" />
<CurrencyField label="Amount" currencySymbol="€" defaultValue="25000" />
<CurrencyField label="Amount" currencySymbol="£" defaultValue="25000" />
<CurrencyField label="Amount" currencySymbol="¥" defaultValue="25000" />`}
      >
        <CurrencyField label="Amount" currencySymbol="$" defaultValue="25000" />
        <CurrencyField label="Amount" currencySymbol="€" defaultValue="25000" />
        <CurrencyField label="Amount" currencySymbol="£" defaultValue="25000" />
        <CurrencyField label="Amount" currencySymbol="¥" defaultValue="25000" />
      </Example>

      <Example
        label="States"
        code={`<CurrencyField label="Amount" />
<CurrencyField label="Amount" description="Whole units" defaultValue="25000" />
<CurrencyField label="Amount" error="Enter an amount" />
<CurrencyField label="Amount" disabled defaultValue="25000" />
<CurrencyField label="Amount" required />`}
      >
        <CurrencyField label="Amount" />
        <CurrencyField label="Amount" description="Whole units" defaultValue="25000" />
        <CurrencyField label="Amount" error="Enter an amount" />
        <CurrencyField label="Amount" disabled defaultValue="25000" />
        <CurrencyField label="Amount" required />
      </Example>

      <StorySource slug="currency-field" />
    </>
  );
}
