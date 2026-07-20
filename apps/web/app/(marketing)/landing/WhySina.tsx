import { why } from "./copy";
import styles from "./WhySina.module.css";

/** The audience tab colours, in reading order (PM / designer / engineer). */
const TONES = ["blue", "violet", "pink"] as const;

/**
 * Three value cards, one per audience lens, laid out on the same ruled
 * wireframe grid as HowItWorks: full-bleed horizontal hairlines band the
 * section into a heading row and a cards row, and the frame's side borders
 * continue the nav/hero sheet down the page.
 *
 * The section carries the `broadsheet` class (as Hero and HowItWorks do) so the
 * `--sinamk-*` palette resolves and follows industry-tint.css, which redefines
 * that palette under its `.broadsheet` twin selectors.
 */
export function WhySina() {
  // No section-level class: the rows own every style, and unlike HowItWorks
  // this section is not an anchor target needing scroll-margin.
  return (
    <section className="broadsheet" aria-labelledby="why-heading">
      {/* No `ruled` here: the internal column dividers belong to the cards band
          only (Figma runs them y=69 to 291), so they stop at this row's rule
          rather than carrying on up through the heading. */}
      <div className={styles.row}>
        <div className={styles.frame}>
          <h2 id="why-heading" className={styles.heading}>
            {why.heading}
          </h2>
        </div>
      </div>

      <div className={styles.row}>
        <div className={`${styles.frame} ${styles.ruled}`}>
          <ul className={styles.cards}>
            {why.cards.map((card, index) => (
              <li key={card.title} className={styles.card}>
                {/* Not aria-hidden: unlike the HowItWorks step numbers, this tab
                    carries real content naming the audience. */}
                <span className={styles.tab} data-tone={TONES[index]}>
                  <span className={styles.tabLabel}>{card.badge}</span>
                </span>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
