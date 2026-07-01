/**
 * Governed-component registry — maps a constitution's `requiredComponent` name to
 * the React component that must render in its place. Phase 4 hard-coded a single
 * string check; this seam lets Phase 6 add governed components (SecurePaymentDialog,
 * PayeeVerificationDialog, …) without rewiring BlockedState.
 */

import type { ComponentType } from "react";

import type { GovernedComponentProps } from "./types";
import { SecureWireDialogHost } from "../_components/SecureWireDialogHost";

const REGISTRY: Record<string, ComponentType<GovernedComponentProps>> = {
  SecureWireDialog: SecureWireDialogHost,
};

/** Resolve the component the gate forces, or null if none is registered. */
export function resolveGovernedComponent(
  name: string | null,
): ComponentType<GovernedComponentProps> | null {
  return name ? (REGISTRY[name] ?? null) : null;
}
