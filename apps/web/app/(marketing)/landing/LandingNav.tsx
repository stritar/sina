import Link from "next/link";
import { toLocalePath } from "@/lib/i18n/paths";
import { ThemeSwitcher } from "../broadsheet";
import { nav, NPM_ORG_URL } from "./copy";
import styles from "./LandingNav.module.css";
import "../broadsheet/broadsheet.css";

/**
 * Minimal landing chrome: wordmark, Docs, the public npm org (the repo is
 * private, so no GitHub link yet), plus the marketing theme switcher. The
 * switcher is a Broadsheet component, so it sits inside a `.broadsheet` scope
 * (which loads the `--sinamk-*` tokens + the dark overrides) — the landing tree
 * stays free of the product `--sina-*` layer.
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
      <div className={`${styles.controls} broadsheet`}>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
