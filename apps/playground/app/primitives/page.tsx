import Link from "next/link";

const PRIMITIVES = [
  { slug: "visually-hidden", name: "VisuallyHidden", tier: "Utility" },
  { slug: "icon", name: "Icon", tier: "Utility" },
  { slug: "dialog", name: "Dialog", tier: "Tier 1" },
  { slug: "button", name: "Button", tier: "Tier 1" },
  { slug: "field", name: "Field", tier: "Tier 1" },
  { slug: "currency-field", name: "CurrencyField", tier: "Tier 1" },
  { slug: "select", name: "Select", tier: "Tier 1" },
  { slug: "alert", name: "Alert", tier: "Tier 1" },
  { slug: "text-field", name: "TextField", tier: "Tier 2" },
  { slug: "checkbox", name: "Checkbox", tier: "Tier 2" },
  { slug: "credential-field", name: "CredentialField", tier: "Tier 2" },
  { slug: "badge", name: "Badge", tier: "Tier 2" },
  { slug: "spinner", name: "Spinner", tier: "Tier 2" },
  { slug: "progress", name: "Progress", tier: "Tier 2" },
  { slug: "chart", name: "Chart", tier: "Tier 2" },
  { slug: "stack", name: "Stack", tier: "Tier 2" },
  { slug: "grid", name: "Grid", tier: "Tier 2" },
  { slug: "summary-list", name: "SummaryList", tier: "Tier 2" },
  { slug: "separator", name: "Separator", tier: "Tier 3" },
  { slug: "tooltip", name: "Tooltip", tier: "Tier 3" },
  { slug: "radio-group", name: "RadioGroup", tier: "Tier 3" },
  { slug: "toast", name: "Toast", tier: "Tier 3" },
  { slug: "scroll-area", name: "ScrollArea", tier: "Tier 3" },
  { slug: "combobox", name: "Combobox", tier: "Tier 3" },
  { slug: "secure-wire-dialog", name: "SecureWireDialog", tier: "Governed" },
];

export default function PrimitivesIndex() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-bg p-12 text-text">
      <h1 className="text-3xl font-semibold tracking-tight">Core Primitives</h1>
      <p className="mt-2 text-sm text-text-muted">
        Phase 2 — headless, accessible primitives rendered in isolation.
      </p>
      <ul className="mt-8 flex flex-col gap-2">
        {PRIMITIVES.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/primitives/${p.slug}`}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition-colors duration-fast ease-standard hover:bg-surface-raised"
            >
              <span className="font-medium">{p.name}</span>
              <span className="font-mono text-xs text-text-subtle">{p.tier}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
