import { Glyph } from "./Glyph";
import styles from "./DoDont.module.css";

/**
 * Paired do / don't guidance (Polaris + Carbon pattern), with the ✅/🚩 grammar
 * from react.dev. Author with two arrays so a page stays terse:
 * `<DoDont do={["…"]} dont={["…"]} />`.
 */

export function DoDont({ do: dos, dont: donts }: { do: string[]; dont: string[] }) {
  return (
    <div className={styles.grid}>
      <div className={styles.col + " " + styles.do}>
        <p className={styles.head}>
          <Glyph name="check" size={16} />
          Do
        </p>
        <ul className={styles.list}>
          {dos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.col + " " + styles.dont}>
        <p className={styles.head}>
          <Glyph name="danger" size={16} />
          Don&rsquo;t
        </p>
        <ul className={styles.list}>
          {donts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
