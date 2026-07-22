import { how } from "./copy";
import styles from "./HowItWorks.module.css";

/**
 * The rule sketch, tokenized by hand.
 *
 * There is no highlighter on the marketing side (shiki only runs at MDX build
 * time for the docs), and pulling one in to colour twelve fixed lines would ship
 * a parser to every landing visitor. The sketch never changes at runtime, so the
 * tokens are authored here and coloured by the `data-t` attribute in CSS.
 *
 * Dash-free illustrative sketch of the real wire rule (packages/fintech).
 */
type TokenKind = "kw" | "fn" | "str" | "num" | "type" | "prop" | "punct";
type Token = readonly [text: string, kind?: TokenKind];

const RULE_SKETCH: readonly (readonly Token[])[] = [
  [["const", "kw"], [" wireTransfer "], ["=", "punct"], [" "], ["z", "type"]],
  [["  "], [".", "punct"], ["object", "fn"], ["({", "punct"]],
  [["    "], ["amount", "prop"], [": ", "punct"], ["minorUnits"], [",", "punct"]],
  [["    "], ["currency", "prop"], [": ", "punct"], ["iso4217"], [",", "punct"]],
  [["    "], ["debtor", "prop"], [": ", "punct"], ["party"], [",", "punct"]],
  [["    "], ["creditor", "prop"], [": ", "punct"], ["party"], [",", "punct"]],
  [["  "], ["})", "punct"]],
  [["  "], [".", "punct"], ["strict", "fn"], ["();", "punct"]],
  [],
  [
    ["if", "kw"],
    [" (", "punct"],
    ["amount"],
    [" > ", "punct"],
    ["usd", "fn"],
    ["(", "punct"],
    ["50_000", "num"],
    [")) {", "punct"],
  ],
  [
    ["  "],
    ["escalate", "fn"],
    ["(", "punct"],
    ['"AMOUNT_REQUIRES_APPROVAL"', "str"],
    [", ", "punct"],
    ['"SecureWireDialog"', "str"],
    [");", "punct"],
  ],
  [["}", "punct"]],
];

/**
 * Three plain steps for the non-technical reader, laid out on the ruled
 * wireframe grid: full-bleed horizontal hairlines band the section into rows,
 * and the frame's side borders continue the nav/hero sheet down the page.
 *
 * The section carries the `broadsheet` class (as Hero does) so the `--sinamk-*`
 * palette resolves and follows industry-tint.css, which redefines that palette
 * under its `.broadsheet` twin selectors.
 */
export function HowItWorks() {
  return (
    <section
      id="how"
      className={`${styles.section} broadsheet`}
      aria-labelledby="how-heading"
    >
      {/* No `ruled` here: the internal column dividers belong to the steps band
          only (Figma runs them y=69 to 291), so they stop at this row's rule
          rather than carrying on up through the heading. */}
      <div className={styles.row}>
        <div className={styles.frame}>
          <h2 id="how-heading" className={styles.heading}>
            {how.heading}
          </h2>
        </div>
      </div>

      <div className={styles.row}>
        <div className={`${styles.frame} ${styles.ruled}`}>
          <ol className={styles.steps}>
            {how.steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span
                  className={styles.marker}
                  data-step={index + 1}
                  aria-hidden="true"
                >
                  <span className={styles.markerLabel}>{index + 1}</span>
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.frame}>
          <h3 className={styles.codeHeading}>{how.codeHeading}</h3>
        </div>
      </div>

      <div className={`${styles.row} ${styles.codeRow}`}>
        <div className={styles.frame}>
          <figure className={styles.panel}>
            <figcaption className={styles.panelBar}>
              <span className={styles.panelFile}>{how.codeFilename}</span>
            </figcaption>
            <pre className={styles.code}>
              <code>
                {RULE_SKETCH.map((line, index) => (
                  <span
                    key={`line-${index}`}
                    className={styles.line}
                    data-line={index + 1}
                  >
                    <span className={styles.lineCode}>
                      {line.map(([text, kind], token) => (
                        <span key={`${index}-${token}`} data-t={kind}>
                          {text}
                        </span>
                      ))}
                      {"\n"}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </figure>
        </div>
      </div>
    </section>
  );
}
