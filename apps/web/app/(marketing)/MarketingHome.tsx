import Link from "next/link";
import { getMessages } from "@/lib/i18n/messages";
import { toLocalePath } from "@/lib/i18n/paths";
import { ThemeToggle } from "../components/docs/ThemeToggle";
import { LanguageSwitcher } from "../components/docs/LanguageSwitcher";
import { LocaleProvider } from "../components/docs/LocaleContext";
import styles from "./page.module.css";

/**
 * The landing page, shared by `/` (English) and `/[lang]` (the five translated
 * locales). Chrome copy comes from the message catalog; the theme + language
 * controls are wrapped in a LocaleProvider so they read the right strings.
 */
export function MarketingHome({ locale }: { locale: string }) {
  const messages = getMessages(locale);
  const docsHref = toLocalePath("/docs", locale);

  return (
    <main className={styles.main}>
      <LocaleProvider locale={locale}>
        <div className={styles.themeSlot}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </LocaleProvider>
      <h1 className={styles.title}>SINA</h1>
      <p className={styles.tagline}>{messages.marketing.tagline}</p>
      <Link className={styles.cta} href={docsHref}>
        {messages.marketing.cta} →
      </Link>
    </main>
  );
}
