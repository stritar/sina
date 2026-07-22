"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live Select demos for /docs/primitives/select. Ported from the playground
 * story (apps/playground/app/primitives/select/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

export function SelectHero() {
  return (
    <Hero>
      <Select defaultValue="wire">
        <SelectTrigger aria-label="Payment rail">
          <SelectValue placeholder="Payment rail" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ach">ACH</SelectItem>
          <SelectItem value="wire">Wire</SelectItem>
          <SelectItem value="rtp">RTP</SelectItem>
        </SelectContent>
      </Select>
    </Hero>
  );
}

export function SelectExamples() {
  return (
    <>
      <Example
        label="Simple list · placeholder via SelectValue"
        code={`<Select>
  <SelectTrigger aria-label="Pick an option">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="alpha">Alpha</SelectItem>
    <SelectItem value="bravo">Bravo</SelectItem>
    <SelectItem value="charlie">Charlie</SelectItem>
    <SelectItem value="delta">Delta</SelectItem>
  </SelectContent>
</Select>`}
      >
        <Select>
          <SelectTrigger aria-label="Pick an option">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem value="bravo">Bravo</SelectItem>
            <SelectItem value="charlie">Charlie</SelectItem>
            <SelectItem value="delta">Delta</SelectItem>
          </SelectContent>
        </Select>
      </Example>

      <Example
        label="Grouped · SelectGroup + SelectLabel + SelectSeparator"
        code={`<Select>
  <SelectTrigger aria-label="Grouped option">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Group one</SelectLabel>
      <SelectItem value="alpha">Alpha</SelectItem>
      <SelectItem value="bravo">Bravo</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Group two</SelectLabel>
      <SelectItem value="charlie">Charlie</SelectItem>
      <SelectItem value="delta">Delta</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
      >
        <Select>
          <SelectTrigger aria-label="Grouped option">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group one</SelectLabel>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="bravo">Bravo</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Group two</SelectLabel>
              <SelectItem value="charlie">Charlie</SelectItem>
              <SelectItem value="delta">Delta</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Example>

      <Example
        label="Disabled · one item, or the whole trigger"
        code={`<Select>
  <SelectTrigger aria-label="Option with a disabled item">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="alpha">Alpha</SelectItem>
    <SelectItem value="bravo" disabled>Bravo (unavailable)</SelectItem>
    <SelectItem value="charlie">Charlie</SelectItem>
  </SelectContent>
</Select>

<Select disabled>
  <SelectTrigger aria-label="Disabled select">
    <SelectValue placeholder="Unavailable" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="alpha">Alpha</SelectItem>
  </SelectContent>
</Select>`}
      >
        <Select>
          <SelectTrigger aria-label="Option with a disabled item">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem value="bravo" disabled>
              Bravo (unavailable)
            </SelectItem>
            <SelectItem value="charlie">Charlie</SelectItem>
          </SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger aria-label="Disabled select">
            <SelectValue placeholder="Unavailable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem value="bravo">Bravo</SelectItem>
          </SelectContent>
        </Select>
      </Example>

      <Example
        label="Pre-selected · defaultValue"
        code={`<Select defaultValue="charlie">
  <SelectTrigger aria-label="Pre-selected option">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="alpha">Alpha</SelectItem>
    <SelectItem value="bravo">Bravo</SelectItem>
    <SelectItem value="charlie">Charlie</SelectItem>
  </SelectContent>
</Select>`}
      >
        <Select defaultValue="charlie">
          <SelectTrigger aria-label="Pre-selected option">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem value="bravo">Bravo</SelectItem>
            <SelectItem value="charlie">Charlie</SelectItem>
          </SelectContent>
        </Select>
      </Example>

      <StorySource slug="select" />
    </>
  );
}
