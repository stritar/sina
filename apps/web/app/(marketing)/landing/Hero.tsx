import Link from "next/link";
import { toLocalePath } from "@/lib/i18n/paths";
import { hero } from "./copy";
import { IndustrySwitcher } from "./IndustrySwitcher";
import { ComingSoonBadge } from "./ComingSoonBadge";
import styles from "./Hero.module.css";

export function Hero({ locale }: { locale: string }) {
  return (
    <section className={styles.hero}>
      <p className={styles.eyebrow}>{hero.eyebrow}</p>
      <h1 className={styles.title}>{hero.title}</h1>
      <p className={styles.subhead}>{hero.subhead}</p>
      <div className={styles.ctas}>
        <a className={styles.ctaPrimary} href="#demo">
          {hero.ctaDemo}
        </a>
        <Link className={styles.ctaSecondary} href={toLocalePath("/docs", locale)}>
          {hero.ctaDocs}
        </Link>
      </div>
      <div className={styles.switcherRow}>
        <IndustrySwitcher />
        <ComingSoonBadge />
      </div>
    </section>
  );
}
