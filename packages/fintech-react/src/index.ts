/**
 * @sina-design-system/fintech-react
 *
 * SINA's governed fintech components — the layer that MARRIES a `core` primitive
 * to the `fintech` constitution and renders the decision the gate already made.
 * This is the one package allowed to import both `core` (primitives) and
 * `fintech` (the rules); it authors no schemas of its own (no `zod`).
 *
 * The invariant (§1b): validation is server-side. These components never gate a
 * payload — they collect intent/evidence and surface the constitution's verdict.
 */

export {
  SecureWireDialog,
  type SecureWireDialogProps,
  type WireApprovalEvidence,
  type SecureWireRegateResult,
} from "./SecureWireDialog/SecureWireDialog.js";
