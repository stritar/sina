/**
 * The shape of the docs UI-chrome message catalog. One object per locale
 * (`en.ts`, `es.ts`, …) satisfies this; every key is a reader-facing string that
 * lives outside the MDX content (header, search, pager, TOC, theme, language,
 * marketing, and the machine-translation notice).
 *
 * Content prose is NOT here — it lives in the `<page>.<locale>.mdx` siblings.
 */
export interface Messages {
  header: {
    /** The "Docs" section label beside the wordmark. */
    section: string;
    /** aria-label for the mobile menu button. */
    openNav: string;
    /** aria-label for the wordmark home link. */
    home: string;
    /** The nav drawer's title + description. */
    drawerTitle: string;
    drawerDescription: string;
  };
  search: {
    trigger: string;
    placeholder: string;
    title: string;
    description: string;
    empty: string;
  };
  pager: {
    previous: string;
    next: string;
  };
  toc: {
    heading: string;
  };
  theme: {
    /** Group label for the segmented control. */
    label: string;
    system: string;
    light: string;
    dark: string;
  };
  language: {
    /** aria-label for the language switcher. */
    label: string;
  };
  marketing: {
    tagline: string;
    cta: string;
  };
  notice: {
    /** Shown on machine-translated (non-English) pages. */
    machineTranslated: string;
  };
}
