"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, localeOf } from "@/lib/i18n/locales";
import { getMessages, type Messages } from "@/lib/i18n/messages";

/**
 * The active docs locale, made available to client chrome (header, search,
 * pager, TOC, theme + language switchers). The English routes render no provider
 * and fall through to the English default; the `[lang]` layout wraps its subtree
 * in `<LocaleProvider locale={lang}>`.
 */
interface LocaleValue {
  locale: string;
  messages: Messages;
  dir: "ltr" | "rtl";
}

const defaultValue: LocaleValue = {
  locale: DEFAULT_LOCALE,
  messages: getMessages(DEFAULT_LOCALE),
  dir: "ltr",
};

const LocaleContext = createContext<LocaleValue>(defaultValue);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const value: LocaleValue = {
    locale,
    messages: getMessages(locale),
    dir: localeOf(locale).dir,
  };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Read the active locale + its chrome messages. Defaults to English. */
export function useLocale(): LocaleValue {
  return useContext(LocaleContext);
}
