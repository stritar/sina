import type { ReactNode } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { DocsShell } from "@/app/components/docs/DocsShell";

/**
 * Docs segment layout — wraps every `/docs` page in the SINA-styled shell
 * (header + sidebar from the fumadocs page tree). Headless: no fumadocs-ui.
 * This is the English (default-locale) tree; `app/[lang]/docs` serves the rest.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell locale={DEFAULT_LOCALE}>{children}</DocsShell>;
}
