/**
 * SearchResults — a SINA presentational fintech component (ungoverned).
 *
 * Renders the validated `search_results` payload: a query echo plus a bounded
 * list of matched entities, each a kind Badge + label (+ optional sublabel and
 * amount). Read-only; brand-open tokens. Free-text fields render as TEXT — never
 * `dangerouslySetInnerHTML` — so markup a tool returned is neutralised. Any
 * action a result later offers must emit a NEW intent through the gate via
 * `onIntent`, never a raw button.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import type { SummaryItem } from "@sina-design-system/core";
import { Badge, Stack, SummaryList } from "@sina-design-system/core";

import { formatAmount } from "../format.js";

export interface SearchResultsProps {
  /** The server-validated `search_results` payload. */
  payload: unknown;
  /**
   * Emit a new intent for any action a result later offers. The host feeds it
   * back through the gate. Unused while the display stays read-only.
   */
  onIntent?: (envelope: IntentEnvelope) => void;
}

type BadgeIntent = "danger" | "success" | "warning" | "info" | "neutral";

/** Kind → Badge intent (a subtle tint; meaning is carried by the badge text, not color). */
const KIND_INTENT: Record<string, BadgeIntent> = {
  transaction: "info",
  payee: "neutral",
  account: "success",
  card: "warning",
  statement: "neutral",
};

interface SearchResultView {
  id: string;
  kind: string;
  label: string;
  sublabel?: string;
  amount?: number;
  currency?: string;
}

interface SearchResultsView {
  query: string;
  results: SearchResultView[];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Read a search-results payload off a (server-validated) shape, tolerating a hostile one. */
function readSearchResults(payload: unknown): SearchResultsView {
  const data = (payload ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.results) ? data.results : [];
  return {
    query: str(data.query),
    results: list.map((row, index) => {
      const r = (row ?? {}) as Record<string, unknown>;
      return {
        id: str(r.id, `result_${index}`),
        kind: str(r.kind, "result"),
        label: str(r.label, "—"),
        sublabel: typeof r.sublabel === "string" ? r.sublabel : undefined,
        amount: typeof r.amount === "number" ? r.amount : undefined,
        currency: typeof r.currency === "string" ? r.currency : undefined,
      };
    }),
  };
}

export function SearchResults({ payload }: SearchResultsProps) {
  const { query, results } = readSearchResults(payload);

  const items: SummaryItem[] = results.map((r) => {
    const intent = KIND_INTENT[r.kind] ?? "neutral";
    const kindLabel = r.kind.charAt(0).toUpperCase() + r.kind.slice(1);
    return {
      label: (
        <span className="flex min-w-0 items-center gap-2">
          <Badge intent={intent} size="sm">
            {kindLabel}
          </Badge>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-ui font-medium text-text">{r.label}</span>
            {r.sublabel ? (
              <span className="truncate text-xs text-text-muted">{r.sublabel}</span>
            ) : null}
          </span>
        </span>
      ),
      value:
        r.amount != null ? (
          <span className="text-ui font-semibold text-text">
            {formatAmount(r.amount, r.currency ?? "USD")}
          </span>
        ) : null,
    };
  });

  return (
    <Stack
      gap={3}
      aria-label={query ? `Search results for ${query}` : "Search results"}
      className="rounded-lg border border-border-subtle bg-surface p-3"
    >
      <span className="text-ui text-text-muted">
        {query ? (
          <>
            Results for <span className="font-medium text-text">{query}</span>
          </>
        ) : (
          "Search results"
        )}
      </span>

      {results.length === 0 ? (
        <p className="py-6 text-center text-ui text-text-muted">
          {query ? `No results for "${query}".` : "No results."}
        </p>
      ) : (
        <SummaryList items={items} />
      )}
    </Stack>
  );
}
