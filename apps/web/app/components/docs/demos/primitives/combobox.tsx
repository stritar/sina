"use client";

import { useState } from "react";
import { Combobox, type ComboboxOption } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Combobox demos for /docs/primitives/combobox. Ported from the
 * playground story (apps/playground/app/primitives/combobox/page.tsx) — keep
 * the two in step when the primitive's prop surface changes.
 */

const CURRENCIES: ComboboxOption[] = [
  { value: "usd", label: "US Dollar" },
  { value: "eur", label: "Euro" },
  { value: "gbp", label: "Pound Sterling" },
  { value: "jpy", label: "Japanese Yen" },
  { value: "chf", label: "Swiss Franc" },
];

const DESCRIBED: ComboboxOption[] = [
  { value: "alpha", label: "Alpha", description: "first" },
  { value: "bravo", label: "Bravo", description: "second" },
  { value: "charlie", label: "Charlie", description: "third" },
  { value: "delta", label: "Delta", description: "fourth" },
];

const SMALL: ComboboxOption[] = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

export function ComboboxHero() {
  const [currency, setCurrency] = useState("usd");

  return (
    <Hero>
      <Combobox
        options={CURRENCIES}
        value={currency}
        onValueChange={setCurrency}
        aria-label="Currency"
        placeholder="Search currencies…"
      />
    </Hero>
  );
}

export function ComboboxExamples() {
  const [value, setValue] = useState("");
  const [described, setDescribed] = useState("");

  return (
    <>
      <Example
        label="Controlled · value + onValueChange"
        code={`const [currency, setCurrency] = useState("");

<Combobox
  options={CURRENCIES}
  value={currency}
  onValueChange={setCurrency}
  aria-label="Currency"
  placeholder="Search currencies…"
/>`}
      >
        <Combobox
          options={CURRENCIES}
          value={value}
          onValueChange={setValue}
          aria-label="Currency"
          placeholder="Search currencies…"
        />
      </Example>

      <Example
        label="With descriptions · option.description"
        code={`<Combobox
  options={[
    { value: "alpha", label: "Alpha", description: "first" },
    { value: "bravo", label: "Bravo", description: "second" },
  ]}
  value={value}
  onValueChange={setValue}
  aria-label="Described option"
  placeholder="Search options…"
/>`}
      >
        <Combobox
          options={DESCRIBED}
          value={described}
          onValueChange={setDescribed}
          aria-label="Described option"
          placeholder="Search options…"
        />
      </Example>

      <Example
        label="Disabled & no results"
        code={`<Combobox options={OPTIONS} disabled aria-label="Disabled option" placeholder="Search options…" />
<Combobox options={SMALL} aria-label="No-results option" placeholder="Try a non-matching query…" />`}
      >
        <Combobox
          options={CURRENCIES}
          disabled
          aria-label="Disabled option"
          placeholder="Search options…"
        />
        <Combobox
          options={SMALL}
          aria-label="No-results option"
          placeholder="Try a non-matching query…"
        />
      </Example>

      <StorySource slug="combobox" />
    </>
  );
}
