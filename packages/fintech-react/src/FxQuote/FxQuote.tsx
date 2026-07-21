/**
 * FxQuote — a SINA presentational fintech component (ungoverned).
 * Renders the validated `fx_quote` payload: a currency pair, its exchange rate, an
 * as-of timestamp, and an optional dealer spread Badge. Read-only; brand-open tokens.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack, SummaryList } from "@sina-design-system/core";
import type { SummaryItem } from "@sina-design-system/core";

import { formatDate } from "../format.js";
import { useFintechLocale } from "../locale.js";
import styles from "./FxQuote.module.css";

export interface FxQuoteProps {
  /** The server-validated `fx_quote` payload (`IntentProps<"fx_quote">` in `@sina-design-system/fintech`). */
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
  /** BCP-47 locale for money/date formatting. Overrides `FintechLocaleProvider`; defaults to `en-US`. */
  locale?: string;
}

interface FxQuoteView {
  base: string;
  quote: string;
  rate: number;
  asOf: string;
  spreadBps?: number;
}

/** Read an FX quote off a (server-validated) payload, tolerating a hostile shape. */
function readFxQuote(payload: unknown): FxQuoteView {
  const d = (payload ?? {}) as Record<string, unknown>;
  return {
    base: typeof d.base === "string" ? d.base : "",
    quote: typeof d.quote === "string" ? d.quote : "",
    rate: typeof d.rate === "number" ? d.rate : 0,
    asOf: typeof d.asOf === "string" ? d.asOf : "",
    spreadBps: typeof d.spreadBps === "number" ? d.spreadBps : undefined,
  };
}

export function FxQuote({ payload, locale: localeProp }: FxQuoteProps) {
  const locale = useFintechLocale(localeProp);
  const q = readFxQuote(payload);
  const hasQuote = q.base !== "" && q.quote !== "";
  const pair = hasQuote ? `${q.base} / ${q.quote}` : "—";

  const items: SummaryItem[] = [
    { label: "Pair", value: pair },
    {
      label: "Rate",
      value: q.rate.toLocaleString(locale, { maximumFractionDigits: 6 }),
      emphasis: true,
    },
    { label: "As of", value: formatDate(q.asOf, locale) },
    ...(q.spreadBps !== undefined
      ? [
          {
            label: "Spread",
            value: (
              <Badge intent="neutral" size="sm">
                {`${q.spreadBps} bps`}
              </Badge>
            ),
          },
        ]
      : []),
  ];

  return (
    <Stack
      gap={3}
      aria-label={hasQuote ? `FX quote ${pair}` : "FX quote"}
      className={styles.root}
    >
      {!hasQuote ? (
        <p className={styles.empty}>No quote available.</p>
      ) : (
        <>
          <span className={styles.pair}>{pair}</span>
          <SummaryList items={items} />
        </>
      )}
    </Stack>
  );
}
