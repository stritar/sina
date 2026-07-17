import { why } from "./copy";
import styles from "./WhySina.module.css";

/** Three value cards, one per audience lens (PM / designer / engineer). */
export function WhySina() {
  return (
    <section className={styles.section} aria-labelledby="why-heading">
      <div className={styles.inner}>
        <h2 id="why-heading" className={styles.heading}>
          {why.heading}
        </h2>
        <ul className={styles.cards}>
          {why.cards.map((card) => (
            <li key={card.title} className={styles.card}>
              <p className={styles.kicker}>{card.kicker}</p>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardBody}>{card.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
