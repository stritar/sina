"use client";

import { INDUSTRIES, hero, type Industry } from "./copy";
import { useIndustry } from "./IndustryContext";
import styles from "./IndustrySwitcher.module.css";

/**
 * The hero's industry control: a fieldset of native radios styled as segmented
 * wireframe chips. Deliberately NOT ARIA tabs; switching changes the hero badge
 * and the whole emulator section below, not one adjacent panel, so a radiogroup
 * is the honest semantic (and native radios bring arrow-key support for free).
 */
const ORDER: readonly Industry[] = ["fintech", "healthcare", "defense"];

export function IndustrySwitcher() {
  const { industry, setIndustry } = useIndustry();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{hero.switcherLabel}</legend>
      <div className={styles.segments}>
        {ORDER.map((id) => (
          <label key={id} className={styles.segment} data-selected={id === industry || undefined}>
            <input
              className={styles.input}
              type="radio"
              name="sina-industry"
              value={id}
              checked={id === industry}
              onChange={() => setIndustry(id)}
            />
            <span>{INDUSTRIES[id].name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
