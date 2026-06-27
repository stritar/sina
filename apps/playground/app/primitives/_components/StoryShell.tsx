import Link from "next/link";
import type { ReactNode } from "react";

/** Consistent isolation frame for a primitive story. */
export function StoryShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-bg p-12 text-text">
      <Link
        href="/primitives"
        className="font-mono text-xs text-text-subtle hover:text-text-muted"
      >
        ← Primitives
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </main>
  );
}

/** A labeled demo cell on a surface card. */
export function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-wide text-text-subtle">{label}</h2>
      <div className="flex flex-wrap items-start gap-4 rounded-lg border border-border bg-surface p-6">
        {children}
      </div>
    </section>
  );
}
