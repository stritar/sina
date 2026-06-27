"use client";

import { Combobox, type ComboboxOption } from "@sina-design-system/core";
import { useState } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";

const ACCOUNTS: ComboboxOption[] = [
  { value: "payroll", label: "Acme Payroll", description: "8810" },
  { value: "holdings", label: "Acme Holdings", description: "3321" },
  { value: "treasury", label: "Acme Treasury", description: "5567" },
  { value: "operating", label: "Globex Operating", description: "1180" },
  { value: "vendor", label: "New vendor", description: "6624" },
];

export default function ComboboxStory() {
  const [value, setValue] = useState("holdings");

  return (
    <StoryShell title="Combobox">
      <Demo label="searchable account picker">
        <div className="w-72">
          <Combobox
            options={ACCOUNTS}
            value={value}
            onValueChange={setValue}
            aria-label="Account"
            placeholder="Search accounts…"
          />
          <p className="mt-3 font-mono text-xs text-text-subtle">selected: {value}</p>
        </div>
      </Demo>
    </StoryShell>
  );
}
