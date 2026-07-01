/**
 * The server-boundary marker — a small banded caption reinforcing §1b: everything
 * below it ran server-side, before any primitive was allowed to mount.
 */

import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export function ServerBoundary({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-md bg-surface-secure px-2.5 py-1 ${className ?? ""}`}
    >
      <ShieldCheck className="size-control-2xs text-success" aria-hidden />
      <span className="font-mono text-xs text-text-muted">
        server-side · validated before mount
      </span>
    </div>
  );
}
