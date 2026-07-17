import Link from "next/link";
import { toLocalePath } from "@/lib/i18n/paths";
import { ThemeToggle } from "../../components/docs/ThemeToggle";
import { LanguageSwitcher } from "../../components/docs/LanguageSwitcher";
import { LocaleProvider } from "../../components/docs/LocaleContext";
import { nav, NPM_ORG_URL } from "./copy";
import styles from "./LandingNav.module.css";

/**
 * Minimal landing chrome: wordmark, Docs, the public npm org (the repo is
 * private, so no GitHub link yet), plus the shared theme + language controls.
 */
export function LandingNav({ locale }: { locale: string }) {
  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#main">
        {nav.skip}
      </a>
      <Link className={styles.wordmark} href={toLocalePath("/", locale)}>
        <span className={styles.mark} aria-hidden="true" />
        {nav.wordmark}
      </Link>
      <nav className={styles.links} aria-label="Site">
        <Link className={styles.link} href={toLocalePath("/docs", locale)}>
          {nav.docs}
        </Link>
        <a className={styles.link} href={NPM_ORG_URL} rel="noreferrer">
          {nav.npm}
        </a>
      </nav>
      <LocaleProvider locale={locale}>
        <div className={styles.controls}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </LocaleProvider>
    </header>
  );
}
