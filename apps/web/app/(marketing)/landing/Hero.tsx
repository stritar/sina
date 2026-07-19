"use client";

import type { ReactNode } from "react";
import { Coin, Asclepius, ShieldChevron } from "@phosphor-icons/react/dist/ssr";
import { InstallCommand, SegmentSelector } from "../broadsheet";
import { INDUSTRIES, hero, type Industry } from "./copy";
import { useIndustry } from "./IndustryContext";
import { ComingSoonBadge } from "./ComingSoonBadge";
import { GlyphField } from "./glyph-field/GlyphField";
import styles from "./Hero.module.css";
import "../broadsheet/broadsheet.css";

const ORDER: readonly Industry[] = ["fintech", "healthcare", "defense"];

/** Left icon per industry; Phosphor nodes are supplied by the caller, never bundled. */
const INDUSTRY_ICONS: Record<Industry, ReactNode> = {
  fintech: <Coin />,
  healthcare: <Asclepius />,
  defense: <ShieldChevron />,
};

/** The five packages an adopter installs, mirrored from the SINA-marketing hero. */
const PACKAGES = [
  "@sina-design-system/theme",
  "@sina-design-system/core",
  "@sina-design-system/fintech",
  "@sina-design-system/fintech-react",
  "@sina-design-system/governance",
] as const;

/**
 * The framed hero: a left text rectangle (title, subhead, the industry segment
 * selector, and the install command) that lets the glyph field show through, and
 * an opaque emulator column on the right (empty for now). The whole section is a
 * `.broadsheet` scope so the `--sinamk-*` palette resolves for the sheet and the
 * reused Broadsheet controls. The segment selector writes `IndustryContext`, the
 * same state the emulator section below reads.
 */
export function Hero() {
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
              <ComingSoonBadge />
            </div>
            <div className={styles.installWrap}>
              <InstallCommand
                size="sm"
                defaultManager="npm"
                packages={PACKAGES}
                className={styles.surface}
              />
            </div>
          </div>
        </div>
        <div className={styles.emulatorCol} aria-hidden="true" />
      </div>
    </section>
  );
}
