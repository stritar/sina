"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe, CaretDown, Check } from "@phosphor-icons/react/dist/ssr";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@sina-design-system/core";
import { LOCALES, localeOf } from "@/lib/i18n/locales";
import { toLocalePath } from "@/lib/i18n/paths";
import { useLocale } from "./LocaleContext";
import styles from "./LanguageSwitcher.module.css";

/**
 * Locale picker: a `core` DropdownMenu behind a secondary Button trigger, so it
 * matches the other header chrome (Search, the Copy Page menu). Selecting a
 * language navigates to the same page in that language. Locale is URL-driven
 * (English at `/docs/...`, others at `/<code>/docs/...`); the choice is also
 * persisted, but there is no first-visit auto-detection.
 */
export function LanguageSwitcher() {
  const { locale, messages } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const active = localeOf(locale);

  function go(next: string) {
    try {
      localStorage.setItem("sina-docs-locale", next);
    } catch {
      // Storage denied (private mode) — navigation still works.
    }
    router.push(toLocalePath(pathname ?? "/", next));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={styles.trigger}
          aria-label={messages.language.label}
        >
          <Globe aria-hidden weight="bold" className={styles.globe} />
          <span className={styles.current}>{active.nativeName}</span>
          <CaretDown aria-hidden weight="bold" className={styles.caretIcon} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={styles.menu}>
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l.code} className={styles.item} onSelect={() => go(l.code)}>
            <Check
              aria-hidden
              weight="bold"
              className={styles.check}
              data-active={l.code === locale || undefined}
            />
            {l.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
