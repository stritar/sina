/**
 * @sina-design-system/fintech-react
 *
 * SINA's fintech component layer — governed AND presentational. It MARRIES a
 * `core` primitive to the `fintech` constitution and renders the decision the
 * gate already made: a forced governed component on escalation (SecureWireDialog),
 * or a presentational display on a clean ungoverned pass (TransactionList,
 * BalanceCard). The one package allowed to import both `core` (primitives) and
 * `fintech` (the rules); it authors no schemas of its own (no `zod`).
 *
 * The invariant (§1b): validation is server-side. These components never gate a
 * payload — governed ones collect evidence and surface the verdict; presentational
 * ones render already-validated props (as text, never raw HTML) and stay
 * read-only: any action re-enters the gate as a new intent.
 */

export {
  SecureWireDialog,
  type SecureWireDialogProps,
  type WireApprovalEvidence,
  type SecureWireRegateResult,
} from "./SecureWireDialog/SecureWireDialog.js";

export { TransactionList, type TransactionListProps } from "./TransactionList/TransactionList.js";
export { BalanceCard, type BalanceCardProps } from "./BalanceCard/BalanceCard.js";
