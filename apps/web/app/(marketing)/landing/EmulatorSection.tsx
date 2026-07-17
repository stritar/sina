import { emulator } from "./copy";
import { ScenarioIntro } from "./ScenarioIntro";
import { Emulator } from "./Emulator";
import styles from "./EmulatorSection.module.css";

/** The demo slot, directly after the hero (the highest-engagement position). */
export function EmulatorSection() {
  return (
    <section id="demo" className={styles.section} aria-labelledby="demo-heading">
      <div className={styles.inner}>
        <h2 id="demo-heading" className={styles.heading}>
          {emulator.heading}
        </h2>
        <p className={styles.sub}>{emulator.sub}</p>
        <ScenarioIntro />
        <Emulator />
      </div>
    </section>
  );
}
