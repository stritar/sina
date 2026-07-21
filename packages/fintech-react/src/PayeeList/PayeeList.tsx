/**
 * PayeeList — a SINA presentational fintech component (ungoverned).
 * Renders the validated `list_payees` payload: saved payees with a masked number
 * and a verified Badge. Read-only; brand-open tokens. Adding/verifying a payee is
 * a governed flow (a new intent), not a button here.
 */

import type { IntentEnvelope } from "@sina-design-system/governance";
import { Badge, Stack } from "@sina-design-system/core";

import { formatDate, readPayeeList } from "../format.js";
import { useFintechLocale } from "../locale.js";
import styles from "./PayeeList.module.css";

export interface PayeeListProps {
  /** The server-validated `list_payees` payload (`IntentProps<"list_payees">` in `@sina-design-system/fintech`). */
  payload: unknown;
  onIntent?: (envelope: IntentEnvelope) => void;
  /** BCP-47 locale for money/date formatting. Overrides `FintechLocaleProvider`; defaults to `en-US`. */
  locale?: string;
}

export function PayeeList({ payload, locale: localeProp }: PayeeListProps) {
  const locale = useFintechLocale(localeProp);
  const payees = readPayeeList(payload);

  return (
    <Stack gap={3} aria-label="Payees" className={styles.card}>
      {payees.length === 0 ? (
        <p className={styles.empty}>No payees to show.</p>
      ) : (
        <Stack as="ul" gap={0} className={styles.list}>
          {payees.map((p) => (
            <Stack
              as="li"
              key={p.id}
              direction="row"
              justify="between"
              align="center"
              gap={3}
              className={styles.row}
            >
              <span className={styles.info}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.masked}>{p.maskedNumber}</span>
              </span>
              <span className={styles.meta}>
                <Badge intent={p.verified ? "success" : "neutral"} size="sm">
                  {p.verified ? "verified" : "unverified"}
                </Badge>
                {p.lastPaidAt ? (
                  <span className={styles.lastPaid}>last {formatDate(p.lastPaidAt, locale)}</span>
                ) : null}
              </span>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
