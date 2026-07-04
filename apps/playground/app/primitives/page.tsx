import Link from "next/link";
import styles from "./page.module.css";

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
  { slug: "line-chart", name: "LineChart", tier: "Tier 2" },
  { slug: "bar-chart", name: "BarChart", tier: "Tier 2" },
  { slug: "pie-chart", name: "PieChart", tier: "Tier 2" },
  { slug: "donut-chart", name: "DonutChart", tier: "Tier 2" },
  { slug: "kpi-stat", name: "KpiStat", tier: "Tier 2" },
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
    <main className={styles.page}>
      <h1 className={styles.heading}>Core Primitives</h1>
      <p className={styles.lede}>
        Phase 2 — headless, accessible primitives rendered in isolation.
      </p>
      <ul className={styles.list}>
        {PRIMITIVES.map((p) => (
          <li key={p.slug}>
            <Link href={`/primitives/${p.slug}`} className={styles.row}>
              <span className={styles.rowName}>{p.name}</span>
              <span className={styles.rowTier}>{p.tier}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
