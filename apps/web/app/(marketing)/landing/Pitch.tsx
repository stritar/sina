import Link from "next/link";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { toLocalePath } from "@/lib/i18n/paths";
import { SinaLogo } from "@/app/components/docs/visuals/SinaLogo";
import { pitch, LINKEDIN_URL } from "./copy";
import { GlyphField } from "./glyph-field/GlyphField";
import styles from "./Pitch.module.css";
import "../broadsheet/broadsheet.css";

/**
 * The one-breath statement of what SINA is, and the band that now closes the
 * page (Figma node 247:2454, "IN TEN SECONDS").
 *
 * Banded onto the same ruled frame as HowItWorks and WhySina above it: a
 * heading row, then a split row carrying the statement, the coda and the docs
 * CTA on the left, with the glyph field showing through the right half.
 *
 * The right half also carries what used to be a standalone footer bar: the SINA
 * mark centered in the band and the license + attribution line along its bottom
 * edge, both layered OVER the field. A third, empty row then runs the frame
 * rails 64px past the closing rule and terminates them, which is how the sheet
 * ends now that there is no footer to close it.
 *
 * The mark is the symbol alone: `SinaLogo` draws symbol + wordmark in a
 * `0 0 77 32` viewBox and the symbol occupies the leading 32 units, so cropping
 * the viewBox reuses the same inline SVG with no second asset. Figma's instance
 * is named "sina logo - full" but its wordmark layer is hidden and its box is a
 * 64px square, so the symbol is what it actually renders.
 */
export function Pitch({ locale }: { locale: string }) {
  return (
    <section className="broadsheet" aria-labelledby="pitch-heading">
      <div className={styles.row}>
        <div className={styles.frame}>
          <h2 id="pitch-heading" className={styles.heading}>
            {pitch.heading}
          </h2>
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.frame} ${styles.split}`}>
          <div className={styles.textCol}>
            <p className={styles.statement}>{pitch.statement}</p>
            <p className={styles.coda}>{pitch.coda}</p>
            {/* A link, never a button: an anchor must not nest one. The
                Broadsheet `lg` anatomy is reproduced locally, same as the hero
                CTA and the nav button. */}
            <Link
              className={styles.ctaButton}
              href={toLocalePath("/docs", locale)}
              data-broadsheet=""
            >
              <span className={styles.ctaIcon} aria-hidden="true">
                <FileText weight="bold" />
              </span>
              <span className={styles.ctaLabel}>{pitch.ctaDocs}</span>
            </Link>
          </div>
          <div className={styles.fieldCol}>
            {/* Wrapped so the field can be dropped on phones without taking the
                mark and the attribution with it: `GlyphField` takes no
                className, and its root is `position: absolute; inset: 0`, so
                the wrapper has to be the box it fills. */}
            <div className={styles.fieldCanvas}>
              <GlyphField />
            </div>
            <div className={styles.fieldContent}>
              <SinaLogo className={styles.logo} viewBox="0 0 32 32" />
              <p className={styles.meta}>
                <span>{pitch.license}</span>
                <span>
                  {pitch.madeBy}
                  <a
                    className={styles.author}
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noreferrer"
                    data-broadsheet=""
                  >
                    {pitch.author}
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* The closing tail: `.frame`'s side borders carry the rails 64px past the
          row's rule and its bottom border terminates them. Decorative only. */}
      <div className={styles.row}>
        <div className={`${styles.frame} ${styles.tail}`} aria-hidden="true" />
      </div>
    </section>
  );
}
