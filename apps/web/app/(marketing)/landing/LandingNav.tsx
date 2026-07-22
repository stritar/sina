import Link from "next/link";
import { FileText, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { SinaLogo } from "@/app/components/docs/visuals/SinaLogo";
import { GITHUB_URL } from "@/lib/links";
import { ThemeSwitcher } from "../broadsheet";
import { nav } from "./copy";
import styles from "./LandingNav.module.css";
import "../broadsheet/broadsheet.css";

/**
 * Landing chrome, framed to match the hero: the SINA brand mark, Docs (primary)
 * and the public source repo (secondary) as button-styled links, plus the
 * marketing theme switcher. Both are anchors, not the Broadsheet `<button>`
 * components, because a link must not nest a button; they reproduce the button
 * anatomy in the module and carry `data-broadsheet` to earn the global blue
 * focus outline.
 *
 * The whole header is a `.broadsheet` scope, so the `--sinamk-*` tokens (and the
 * dark overrides) resolve for the bar + the SinaLogo's `currentColor`. The inner
 * bar is an opaque sheet at the same 90rem width and page gutter as the hero, so
 * their side borders line up into one continuous frame.
 */
export function LandingNav() {
  return (
    <header className={`${styles.header} broadsheet`}>
      <div className={styles.inner}>
        <a className={styles.skip} href="#main">
          {nav.skip}
        </a>
        <Link
          className={styles.wordmark}
          href="/"
          aria-label={nav.wordmark}
          data-broadsheet=""
        >
          <SinaLogo className={styles.logo} />
        </Link>
        <div className={styles.cluster}>
          <nav className={styles.links} aria-label="Site">
            <Link
              className={`${styles.navBtn} ${styles.navBtnPrimary}`}
              href="/docs"
              data-broadsheet=""
            >
              <span className={styles.icon} aria-hidden="true">
                <FileText />
              </span>
              <span className={styles.label}>{nav.docs}</span>
            </Link>
            <a
              className={`${styles.navBtn} ${styles.navBtnSecondary}`}
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              data-broadsheet=""
            >
              <span className={styles.icon} aria-hidden="true">
                <GithubLogo weight="bold" />
              </span>
              <span className={styles.label}>{nav.github}</span>
            </a>
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
