import Link from "next/link";
import { toLocalePath } from "@/lib/i18n/paths";
import { finalCta, NPM_ORG_URL } from "./copy";
import styles from "./FinalCta.module.css";

export function FinalCta({ locale }: { locale: string }) {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <div className={styles.inner}>
        <h2 id="cta-heading" className={styles.heading}>
          {finalCta.heading}
        </h2>
        <p className={styles.sub}>{finalCta.sub}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={toLocalePath("/docs", locale)}>
            {finalCta.docs}
          </Link>
          <a className={styles.secondary} href={NPM_ORG_URL} rel="noreferrer">
            {finalCta.npm}
          </a>
        </div>
        <pre className={styles.install}>
          <code>{finalCta.install}</code>
        </pre>
      </div>
    </section>
  );
}
