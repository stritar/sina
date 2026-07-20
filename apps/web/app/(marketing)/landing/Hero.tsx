"use client";

import Link from "next/link";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { toLocalePath } from "@/lib/i18n/paths";
import { InstallCommand, SegmentSelector } from "../broadsheet";
import { INDUSTRIES, hero, type Industry } from "./copy";
import { INDUSTRY_ICONS } from "./industry-icons";
import { useIndustry } from "./IndustryContext";
import { GlyphField } from "./glyph-field/GlyphField";
import { HeroEmulator } from "./hero-emulator/HeroEmulator";
import styles from "./Hero.module.css";
import "../broadsheet/broadsheet.css";

const ORDER: readonly Industry[] = ["fintech", "healthcare", "defense"];

/**
 * The framed hero: a left text rectangle (title, subhead, the industry segment
 * selector, and the install command) that lets the glyph field show through, and
 * the composer emulator on the opaque right column. The whole section is a
 * `.broadsheet` scope so the `--sinamk-*` palette resolves for the sheet and the
 * reused Broadsheet controls. The segment selector writes `IndustryContext`, the
 * same state the emulator reads.
 */
export function Hero({ locale }: { locale: string }) {
  const { industry, setIndustry } = useIndustry();

  const items = ORDER.map((id) => ({
    value: id,
    label: INDUSTRIES[id].name,
    icon: INDUSTRY_ICONS[id],
  }));

  return (
    <section className={`${styles.hero} broadsheet`}>
      <div className={styles.inner}>
        <div className={styles.textCol}>
          <GlyphField />
          <div className={styles.headingGroup}>
            <h1 className={styles.title}>{hero.title}</h1>
            <p className={styles.subhead}>{hero.subhead}</p>
          </div>
          <div className={styles.controls}>
            <div className={styles.industryRow}>
              <div className={styles.segments}>
                <SegmentSelector
                  size="md"
                  aria-label={hero.switcherLabel}
                  items={items}
                  value={industry}
                  onValueChange={(value) => setIndustry(value as Industry)}
                  className={styles.surface}
                />
              </div>
            </div>
            {/* Permanently mounted so the announcement fires when the industry
                flips to one whose constitution has not shipped. */}
            <div className={styles.installWrap} aria-live="polite">
              <InstallCommand
                size="sm"
                defaultManager="npm"
                packages={INDUSTRIES[industry].packages}
                comingSoon={!INDUSTRIES[industry].live}
                comingSoonLabel={hero.comingSoon}
                className={styles.surface}
              />
            </div>
          </div>
          <div className={styles.ctaRow}>
            <Link
              className={styles.ctaButton}
              href={toLocalePath("/docs", locale)}
              data-broadsheet=""
            >
              <span className={styles.ctaIcon} aria-hidden="true">
                <FileText weight="bold" />
              </span>
              <span className={styles.ctaLabel}>{hero.ctaDocs}</span>
            </Link>
          </div>
        </div>
        <div className={styles.emulatorCol}>
          <HeroEmulator className={styles.emulatorEnter} />
        </div>
      </div>
    </section>
  );
}
