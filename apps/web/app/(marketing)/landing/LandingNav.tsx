import Link from "next/link";
import { Code, FileText } from "@phosphor-icons/react/dist/ssr";
import { toLocalePath } from "@/lib/i18n/paths";
import { SinaLogo } from "@/app/components/docs/visuals/SinaLogo";
import { ThemeSwitcher } from "../broadsheet";
import { nav, NPM_ORG_URL } from "./copy";
import styles from "./LandingNav.module.css";
import "../broadsheet/broadsheet.css";

/**
 * Landing chrome, framed to match the hero: the SINA brand mark, Docs (primary)
 * and the public npm org (secondary) as button-styled links, plus the marketing
 * theme switcher. Docs/npm are anchors, not the Broadsheet `<button>` components,
 * because a link must not nest a button; they reproduce the button anatomy in the
 * module and carry `data-broadsheet` to earn the global blue focus outline.
 *
 * The whole header is a `.broadsheet` scope, so the `--sinamk-*` tokens (and the
 * dark overrides) resolve for the bar + the SinaLogo's `currentColor`. The inner
 * bar is an opaque sheet at the same 90rem width and page gutter as the hero, so
 * their side borders line up into one continuous frame.
 */
export function LandingNav({ locale }: { locale: string }) {
  return (
    <header className={`${styles.header} broadsheet`}>
      <div className={styles.inner}>
        <a className={styles.skip} href="#main">
          {nav.skip}
        </a>
        <Link
          className={styles.wordmark}
          href={toLocalePath("/", locale)}
          aria-label={nav.wordmark}
          data-broadsheet=""
        >
          <SinaLogo className={styles.logo} />
        </Link>
        <div className={styles.cluster}>
          <nav className={styles.links} aria-label="Site">
            <Link
              className={`${styles.navBtn} ${styles.navBtnPrimary}`}
              href={toLocalePath("/docs", locale)}
              data-broadsheet=""
            >
              <span className={styles.icon} aria-hidden="true">
                <FileText />
              </span>
              <span className={styles.label}>{nav.docs}</span>
            </Link>
            <a
              className={`${styles.navBtn} ${styles.navBtnSecondary}`}
              href={NPM_ORG_URL}
              rel="noreferrer"
              data-broadsheet=""
            >
              <span className={styles.icon} aria-hidden="true">
                <Code />
              </span>
              <span className={styles.label}>{nav.npm}</span>
            </a>
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
