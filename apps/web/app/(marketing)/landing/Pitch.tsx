import { pitch } from "./copy";
import styles from "./Pitch.module.css";

/** The one-breath statement of what SINA is, between the value cards and the CTA. */
export function Pitch() {
  return (
    <section className={styles.section} aria-labelledby="pitch-heading">
      <div className={styles.inner}>
        <p id="pitch-heading" className={styles.eyebrow}>
          {pitch.eyebrow}
        </p>
        <p className={styles.statement}>{pitch.statement}</p>
        <p className={styles.coda}>{pitch.coda}</p>
      </div>
    </section>
  );
}
