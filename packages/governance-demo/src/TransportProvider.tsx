"use client";

/**
 * Installs the {@link GateTransport} the governed hosts re-gate through.
 *
 * Context rather than props: the hosts are resolved by NAME out of the registry and
 * rendered through the fixed `GovernedComponentProps` contract, so passing the
 * transport down would mean drilling it through `GateReply` → `BlockedState` → the
 * resolved host, and widening that contract for every governed component ever added.
 * With context the registry stays closed: a new governed component gets the server
 * seam for free by calling `useGateTransport()`.
 *
 * `useGateTransport` THROWS when no provider is installed. That is the point — a
 * demo that cannot reach a server gate must fail loudly rather than quietly degrade
 * into a client-side "validation" (§1b).
 */

import { createContext, useContext, type ReactNode } from "react";

import type { GateTransport } from "./transport.js";

const TransportContext = createContext<GateTransport | null>(null);

export function GateTransportProvider({
  transport,
  children,
}: {
  transport: GateTransport;
  children: ReactNode;
}) {
  return <TransportContext.Provider value={transport}>{children}</TransportContext.Provider>;
}

export function useGateTransport(): GateTransport {
  const transport = useContext(TransportContext);
  if (!transport) {
    throw new Error(
      "No GateTransport in context. The gate runs server-side (ROADMAP §1b), so a demo " +
        "must be wrapped in <GateTransportProvider> with a transport that reaches a server " +
        '— a "use server" action, or an Edge Route Handler.',
    );
  }
  return transport;
}
