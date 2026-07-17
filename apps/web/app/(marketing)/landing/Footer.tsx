import Link from "next/link";
import { toLocalePath } from "@/lib/i18n/paths";
import { footer, nav, NPM_ORG_URL } from "./copy";
import styles from "./Footer.module.css";

export function Footer({ locale }: { locale: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.line}>{footer.line}</p>
        <nav className={styles.links} aria-label="Footer">
          <Link className={styles.link} href={toLocalePath("/docs", locale)}>
            {nav.docs}
          </Link>
          <a className={styles.link} href={NPM_ORG_URL} rel="noreferrer">
            {nav.npm}
          </a>
        </nav>
      </div>
    </footer>
  );
}
