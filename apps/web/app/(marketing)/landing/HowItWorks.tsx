import { how } from "./copy";
import styles from "./HowItWorks.module.css";

/* Dash-free illustrative sketch of the real wire rule (packages/fintech). */
const RULE_SKETCH = `const wireTransfer = z
  .object({
    amount: minorUnits,
    currency: iso4217,
    debtor: party,
    creditor: party,
  })
  .strict();

if (amount > usd(50_000)) {
  escalate("AMOUNT_REQUIRES_APPROVAL", "SecureWireDialog");
}`;

/**
 * Three plain steps for the non-technical reader; the code peek is opt-in
 * behind a disclosure so engineers get the mechanism without forcing it on
 * everyone else.
 */
export function HowItWorks() {
  return (
    <section id="how" className={styles.section} aria-labelledby="how-heading">
      <div className={styles.inner}>
        <h2 id="how-heading" className={styles.heading}>
          {how.heading}
        </h2>
        <ol className={styles.steps}>
          {how.steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </li>
          ))}
        </ol>
        <details className={styles.details}>
          <summary className={styles.summary}>{how.codeSummary}</summary>
          <pre className={styles.code}>
            <code>{RULE_SKETCH}</code>
          </pre>
          <p className={styles.caption}>{how.codeCaption}</p>
        </details>
      </div>
    </section>
  );
}
