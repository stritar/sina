"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Chart,
  Checkbox,
  Combobox,
  CredentialField,
  CurrencyField,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  Grid,
  Icon,
  KpiStat,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Spinner,
  Stack,
  SummaryList,
  TextField,
  VisuallyHidden,
} from "@sina-design-system/core";
import { CheckCircle, ShieldCheck, X } from "@phosphor-icons/react/dist/ssr";
import styles from "./gallery.module.css";

/**
 * Shadcn-style visual gallery for /docs/primitives — one card per primitive
 * with a tiny real specimen, the name linking to its page, and the one-line
 * blurb. Specimens are ported from each primitive's live demo module
 * (`demos/primitives/<slug>.tsx`); keep them in step. The preview pane is
 * `aria-hidden` + `inert` so the specimen is pure decoration: nothing inside
 * it is focusable or announced, and the card's only interactive element is
 * the name link.
 */

const noop = () => {};

/** Sparkline data ported from the Chart demo module. */
const SPARK_UP = [10, 12, 9, 15, 14, 18, 22, 21, 26];
const SPARK = { width: "7rem", height: "2.25rem" } as const;

const CURRENCIES = [
  { value: "usd", label: "US Dollar" },
  { value: "eur", label: "Euro" },
  { value: "gbp", label: "Pound Sterling" },
];

type GalleryEntry = {
  href: string;
  name: string;
  blurb: string;
  preview: ReactNode;
};

type GallerySection = {
  heading: string;
  entries: GalleryEntry[];
};

const SECTIONS: GallerySection[] = [
  {
    heading: "Actions",
    entries: [
      {
        href: "/docs/primitives/button",
        name: "Button",
        blurb: "Trigger an action.",
        preview: (
          <>
            <Button size="sm" iconLeft={<ShieldCheck weight="fill" />}>
              Approve
            </Button>
            <Button size="sm" variant="secondary">
              Cancel
            </Button>
          </>
        ),
      },
    ],
  },
  {
    heading: "Forms & inputs",
    entries: [
      {
        href: "/docs/primitives/field",
        name: "Field",
        blurb: "Label, description, and error for any control.",
        preview: (
          <Field label="Recipient" description="Full legal name on the account">
            <input placeholder="Jane Doe" />
          </Field>
        ),
      },
      {
        href: "/docs/primitives/text-field",
        name: "TextField",
        blurb: "Single- or multi-line text input.",
        preview: <TextField label="Recipient name" placeholder="Acme Payroll" />,
      },
      {
        href: "/docs/primitives/currency-field",
        name: "CurrencyField",
        blurb: "Formatted money input.",
        preview: <CurrencyField label="Amount" currencySymbol="$" defaultValue="25000" />,
      },
      {
        href: "/docs/primitives/credential-field",
        name: "CredentialField",
        blurb: "Masked secret and one-time code.",
        preview: <CredentialField label="Approval code" defaultValue="8F2K9Q" />,
      },
      {
        href: "/docs/primitives/select",
        name: "Select",
        blurb: "Choose one from a list.",
        preview: (
          <Select defaultValue="wire">
            <SelectTrigger aria-label="Payment rail">
              <SelectValue placeholder="Payment rail" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ach">ACH</SelectItem>
              <SelectItem value="wire">Wire</SelectItem>
              <SelectItem value="rtp">RTP</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        href: "/docs/primitives/combobox",
        name: "Combobox",
        blurb: "Searchable single-select.",
        preview: (
          <Combobox
            options={CURRENCIES}
            value="usd"
            onValueChange={noop}
            aria-label="Currency"
            placeholder="Search currencies…"
          />
        ),
      },
      {
        href: "/docs/primitives/dropdown-menu",
        name: "DropdownMenu",
        blurb: "A menu of commands from a trigger.",
        preview: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                Page actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>View as Markdown</DropdownMenuItem>
              <DropdownMenuItem>Open in Claude</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
      {
        href: "/docs/primitives/checkbox",
        name: "Checkbox",
        blurb: "Boolean or indeterminate toggle.",
        preview: (
          <Stack gap={2} align="start">
            <Checkbox label="Wire" defaultChecked />
            <Checkbox label="ACH" checked="indeterminate" onCheckedChange={noop} />
          </Stack>
        ),
      },
      {
        href: "/docs/primitives/radio-group",
        name: "RadioGroup",
        blurb: "Choose one, exclusively.",
        preview: (
          <RadioGroup defaultValue="standard" aria-label="Priority level">
            <RadioGroupItem value="standard" label="Standard" />
            <RadioGroupItem value="priority" label="Priority" />
          </RadioGroup>
        ),
      },
    ],
  },
  {
    heading: "Feedback & status",
    entries: [
      {
        href: "/docs/primitives/alert",
        name: "Alert",
        blurb: "An inline status banner.",
        preview: (
          <Alert variant="warning" title="Approval required">
            Needs a second approver.
          </Alert>
        ),
      },
      {
        href: "/docs/primitives/badge",
        name: "Badge",
        blurb: "A compact status chip.",
        preview: (
          <>
            <Badge intent="success" dot>
              Verified
            </Badge>
            <Badge intent="warning">Review</Badge>
            <Badge intent="danger">Blocked</Badge>
          </>
        ),
      },
      {
        href: "/docs/primitives/toast",
        name: "Toast",
        blurb: "A transient notification.",
        // Static stand-in for the success toast spec — a real Toast needs
        // ToastProvider + a fixed-position ToastViewport, which would escape
        // the preview pane.
        preview: (
          <div className={styles.toastBox}>
            <CheckCircle weight="bold" size={18} />
            <div>
              <div className={styles.toastTitle}>Saved</div>
              <div className={styles.toastDescription}>Your changes were stored.</div>
            </div>
          </div>
        ),
      },
      {
        href: "/docs/primitives/spinner",
        name: "Spinner",
        blurb: "A loading indicator.",
        preview: <Spinner size="lg" label="Loading" />,
      },
      {
        href: "/docs/primitives/progress",
        name: "Progress",
        blurb: "Determinate or indeterminate progress.",
        preview: (
          <div className={styles.block}>
            <Progress value={62} label="Progress 62 percent" />
          </div>
        ),
      },
      {
        href: "/docs/primitives/tooltip",
        name: "Tooltip",
        blurb: "A hover / focus hint.",
        // Static trigger + bubble — the pane is inert, so a live Radix
        // tooltip could never open.
        preview: (
          <div className={styles.tooltipSpecimen}>
            <span className={styles.tooltipBubble}>A short, supplementary hint.</span>
            <Button size="sm" variant="secondary">
              Hover or focus me
            </Button>
          </div>
        ),
      },
    ],
  },
  {
    heading: "Overlays",
    entries: [
      {
        href: "/docs/primitives/dialog",
        name: "Dialog",
        blurb: "A focus-trapped modal.",
        // The trigger is the dialog's static visible part; the pane is inert,
        // so a non-functional Button specimen is safe.
        preview: <Button size="sm">Open dialog</Button>,
      },
      {
        href: "/docs/primitives/scroll-area",
        name: "ScrollArea",
        blurb: "A styled, accessible scroll region.",
        preview: (
          <div className={styles.block}>
            {/* Inline height is the sanctioned ScrollArea exception. */}
            <ScrollArea style={{ height: 72 }}>
              <Stack gap={1}>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={styles.scrollRow}>
                    Row {i + 1}
                  </div>
                ))}
              </Stack>
            </ScrollArea>
          </div>
        ),
      },
      {
        href: "/docs/primitives/separator",
        name: "Separator",
        blurb: "A visual or semantic divider.",
        preview: (
          <Stack direction="row" gap={3} align="center">
            <span>Edit</span>
            <Separator orientation="vertical" />
            <span>Duplicate</span>
            <Separator orientation="vertical" />
            <span>Delete</span>
          </Stack>
        ),
      },
    ],
  },
  {
    heading: "Layout",
    entries: [
      {
        href: "/docs/primitives/stack",
        name: "Stack",
        blurb: "One-axis flex layout.",
        preview: (
          <Stack direction="row" gap={2}>
            <Badge>Wire</Badge>
            <Badge>ACH</Badge>
            <Badge>SEPA</Badge>
          </Stack>
        ),
      },
      {
        href: "/docs/primitives/grid",
        name: "Grid",
        blurb: "Wrapped column layout.",
        preview: (
          <Grid cols={3} gap={2}>
            {["1", "2", "3", "4", "5", "6"].map((cell) => (
              <Stack key={cell} align="center">
                <Badge size="sm">{cell}</Badge>
              </Stack>
            ))}
          </Grid>
        ),
      },
    ],
  },
  {
    heading: "Data display",
    entries: [
      {
        href: "/docs/primitives/kpi-stat",
        name: "KpiStat",
        blurb: "A headline stat with trend.",
        preview: (
          <KpiStat value={12500} comparisonValue={11800} comparisonLabel="vs last month" size="sm" />
        ),
      },
      {
        href: "/docs/primitives/summary-list",
        name: "SummaryList",
        blurb: "Key/value review rows.",
        preview: (
          <div className={styles.block}>
            <SummaryList
              items={[
                { label: "Amount", value: "$60,000.00", emphasis: true },
                { label: "Rail", value: "Wire" },
              ]}
            />
          </div>
        ),
      },
      {
        href: "/docs/primitives/chart",
        name: "Chart",
        blurb: "A server-safe sparkline.",
        preview: (
          <Chart
            data={SPARK_UP}
            label="Up 160% over 9 points"
            style={{ ...SPARK, color: "var(--sina-color-success)" }}
          />
        ),
      },
      {
        href: "/docs/primitives/line-chart",
        name: "LineChart",
        blurb: "Line and area charts.",
        // Server-safe Chart sparklines stand in — LineChart mounts Chart.js.
        preview: (
          <>
            <Chart
              data={SPARK_UP}
              label="Line trend, up"
              style={{ ...SPARK, color: "var(--sina-color-primary)" }}
            />
            <Chart
              data={SPARK_UP}
              variant="area"
              label="Area trend, up"
              style={{ ...SPARK, color: "var(--sina-color-info)" }}
            />
          </>
        ),
      },
      {
        href: "/docs/primitives/bar-chart",
        name: "BarChart",
        blurb: "Vertical or horizontal bars.",
        // Server-safe Chart bar sparkline stands in — BarChart mounts Chart.js.
        preview: (
          <Chart
            data={SPARK_UP}
            variant="bar"
            label="Weekly volume"
            style={{ ...SPARK, color: "var(--sina-color-primary)" }}
          />
        ),
      },
      {
        href: "/docs/primitives/pie-chart",
        name: "PieChart",
        blurb: "Part-to-whole slices.",
        // Token-colored CSS stand-in — PieChart mounts Chart.js.
        preview: <div className={styles.pie} />,
      },
      {
        href: "/docs/primitives/donut-chart",
        name: "DonutChart",
        blurb: "A pie with a center label.",
        // Token-colored CSS stand-in — DonutChart mounts Chart.js.
        preview: (
          <div className={styles.pie}>
            <div className={styles.donutHole}>
              <span className={styles.donutLabel}>86</span>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    heading: "Accessibility substrate",
    entries: [
      {
        href: "/docs/primitives/icon",
        name: "Icon",
        blurb: "A labelled or decorative glyph.",
        preview: (
          <>
            <Icon icon={ShieldCheck} decorative size={28} />
            <Icon icon={ShieldCheck} decorative size={28} weight="bold" />
            <Icon icon={ShieldCheck} decorative size={28} weight="duotone" />
          </>
        ),
      },
      {
        href: "/docs/primitives/visually-hidden",
        name: "VisuallyHidden",
        blurb: "Screen-reader-only text.",
        preview: (
          <div className={styles.specimenCol}>
            <Button variant="secondary" size="sm">
              <Icon icon={X} decorative size={16} weight="bold" />
              <VisuallyHidden>Close</VisuallyHidden>
            </Button>
            <span className={styles.specCaption}>announced as “Close”</span>
          </div>
        ),
      },
    ],
  },
];

export function PrimitivesGallery() {
  return (
    <div className={styles.gallery}>
      {SECTIONS.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <div className={styles.grid}>
            {section.entries.map((entry) => (
              <article key={entry.href} className={styles.card}>
                <div className={styles.preview} aria-hidden="true" inert>
                  {entry.preview}
                </div>
                <Link href={entry.href} className={styles.name}>
                  {entry.name}
                </Link>
                <p className={styles.blurb}>{entry.blurb}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
