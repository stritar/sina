"use client";

import { Combobox, type ComboboxOption } from "@sina-design-system/core";
import { useState } from "react";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const OPTIONS: ComboboxOption[] = [
  { value: "alpha", label: "Alpha" },
  { value: "bravo", label: "Bravo" },
  { value: "charlie", label: "Charlie" },
  { value: "delta", label: "Delta" },
  { value: "echo", label: "Echo" },
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

export default function ComboboxStory() {
  const [value, setValue] = useState("");
  const [described, setDescribed] = useState("");
  const [preselected, setPreselected] = useState("charlie");

  return (
    <StoryShell title="Combobox">
      <Demo label="Default (controlled value + onValueChange)">
        <div className={styles.field}>
          <Combobox
            options={OPTIONS}
            value={value}
            onValueChange={setValue}
            aria-label="Option"
            placeholder="Search options…"
          />
          <p className={styles.hint}>
            selected: {value || "—"}
          </p>
        </div>
      </Demo>

      <Demo label="With descriptions (option.description)">
        <div className={styles.field}>
          <Combobox
            options={DESCRIBED}
            value={described}
            onValueChange={setDescribed}
            aria-label="Described option"
            placeholder="Search options…"
          />
        </div>
      </Demo>

      <Demo label="Pre-selected (initial value)">
        <div className={styles.field}>
          <Combobox
            options={OPTIONS}
            value={preselected}
            onValueChange={setPreselected}
            aria-label="Pre-selected option"
            placeholder="Search options…"
          />
          <p className={styles.hint}>
            selected: {preselected || "—"}
          </p>
        </div>
      </Demo>

      <Demo label="Disabled">
        <div className={styles.field}>
          <Combobox
            options={OPTIONS}
            disabled
            aria-label="Disabled option"
            placeholder="Search options…"
          />
        </div>
      </Demo>

      <Demo label="No results (type a non-matching query, e.g. “zzz”)">
        <div className={styles.field}>
          <Combobox
            options={SMALL}
            aria-label="No-results option"
            placeholder="Try a non-matching query…"
          />
        </div>
      </Demo>
    </StoryShell>
  );
}
