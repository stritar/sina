/**
 * Component registry — maps a mount name (from the router's `Decision`) to the
 * React component that renders it. Two kinds:
 *
 *   - GOVERNED: the component a constitution FORCES on escalation. It collects
 *     evidence and re-gates server-side (SecureWireDialog, …).
 *   - PRESENTATIONAL: the component an ungoverned clean pass mounts. It renders
 *     already-validated props read-only (TransactionList, BalanceCard, …).
 *
 * This seam is how new patterns land without rewiring the gate or the chat.
 */

import type { ComponentType } from "react";
import { BalanceCard, TransactionList } from "@sina-design-system/fintech-react";

import type { GovernedComponentProps } from "./types";
import { SecureWireDialogHost } from "../_components/SecureWireDialogHost";

/** Presentational components take the validated payload and render it read-only. */
type PresentationalProps = { payload: unknown };

const GOVERNED: Record<string, ComponentType<GovernedComponentProps>> = {
  SecureWireDialog: SecureWireDialogHost,
};

const PRESENTATIONAL: Record<string, ComponentType<PresentationalProps>> = {
  TransactionList,
  BalanceCard,
};

/** Resolve the governed component the gate forces, or null if none is registered. */
export function resolveGovernedComponent(
  name: string | null,
): ComponentType<GovernedComponentProps> | null {
  return name ? (GOVERNED[name] ?? null) : null;
}

/** Resolve the presentational component an ungoverned pass mounts, or null. */
export function resolvePresentational(
  name: string | null,
): ComponentType<PresentationalProps> | null {
  return name ? (PRESENTATIONAL[name] ?? null) : null;
}
