"use client";

/**
 * Locale context for the fintech component layer.
 *
 * The formatters in `format.ts` default to `en-US` (issue: SINA components rendered
 * "Jul 20, 2026" beside a host app on `en-IE`). Wrap a surface in
 * {@link FintechLocaleProvider} to make every SINA fintech component inside it format
 * money, dates, and percents with the host locale; a component may still override per
 * instance via its `locale` prop. Presentation only — never feeds the gate.
 */

import { createContext, useContext, type ReactNode } from "react";

import { DEFAULT_LOCALE } from "./format.js";

const FintechLocaleContext = createContext<string>(DEFAULT_LOCALE);

export interface FintechLocaleProviderProps {
  /** A BCP-47 locale tag (e.g. `"en-IE"`, `"de-DE"`). Defaults to `"en-US"`. */
  locale: string;
  children: ReactNode;
}

/** Sets the locale every SINA fintech component below it formats with. */
export function FintechLocaleProvider({
  locale,
  children,
}: FintechLocaleProviderProps) {
  return (
    <FintechLocaleContext.Provider value={locale}>
      {children}
    </FintechLocaleContext.Provider>
  );
}

/**
 * The locale a component should format with. An explicit `override` (the component's
 * own `locale` prop) wins over the provider; the provider defaults to `"en-US"`.
 */
export function useFintechLocale(override?: string): string {
  const fromContext = useContext(FintechLocaleContext);
  return override ?? fromContext;
}
