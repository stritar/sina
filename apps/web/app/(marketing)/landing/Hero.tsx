"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
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

/** `useLayoutEffect` on the client (applies the rewound state before the browser
    paints, so there's no flash of the full title), a no-op `useEffect` on the
    server so SSR doesn't warn. */
const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

/** Per-character cadence of the H1 typewriter, in ms. */
const TYPE_MS = 38;

type RevealPhase = "idle" | "typing" | "revealed";

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

  // On load, type the H1 out character by character, then fade the subhead +
  // controls in. `count` starts at the full length so SSR / no-JS / reduced-motion
  // render the complete, static heading; the effect rewinds it before first paint.
  const [count, setCount] = useState(hero.title.length);
  const [phase, setPhase] = useState<RevealPhase>("idle");

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCount(0);
    setPhase("typing");
    let typed = 0;
    const id = window.setInterval(() => {
      typed += 1;
      setCount(typed);
      if (typed >= hero.title.length) {
        window.clearInterval(id);
        setPhase("revealed");
      }
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, []);

  const items = ORDER.map((id) => ({
    value: id,
    label: INDUSTRIES[id].name,
    icon: INDUSTRY_ICONS[id],
  }));

  return (
    <section className={`${styles.hero} broadsheet`}>
      <div className={styles.inner}>
        <div className={styles.textCol} data-phase={phase}>
          <GlyphField />
          <h1 className={styles.title}>
            <span className={styles.typed}>{hero.title.slice(0, count)}</span>
            <span className={styles.rest}>{hero.title.slice(count)}</span>
          </h1>
          <p className={styles.subhead}>{hero.subhead}</p>
          <div className={styles.controls}>
            <div className={styles.industryRow}>
              <div className={styles.segments}>
                <SegmentSelector
                  size="md"
                  aria-label={hero.switcherLabel}
                  items={items}
                  value={industry}
                  onValueChange={(value) => setIndustry(value as Industry)}
                />
              </div>
              <ComingSoonBadge />
            </div>
            <div className={styles.installWrap}>
              <InstallCommand size="sm" defaultManager="npm" packages={PACKAGES} />
            </div>
          </div>
        </div>
        <div className={styles.emulatorCol} aria-hidden="true" />
      </div>
    </section>
  );
}
