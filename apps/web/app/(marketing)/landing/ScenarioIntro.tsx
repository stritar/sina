"use client";

import { INDUSTRIES, emulator } from "./copy";
import { useIndustry } from "./IndustryContext";
import styles from "./ScenarioIntro.module.css";

/** The per-industry persona narrative: where SINA comes in, in plain words. */
export function ScenarioIntro() {
  const { industry } = useIndustry();
  const def = INDUSTRIES[industry];

  return (
    <div className={styles.intro}>
      <p className={styles.kicker}>
        <span className={styles.kickerLabel}>
          {def.name} {emulator.scenarioKicker.toLowerCase()}
        </span>
        <span className={styles.mode} data-live={def.live || undefined}>
          {def.modeTag}
        </span>
      </p>
      <p className={styles.narrative}>{def.narrative}</p>
    </div>
  );
}
