import {
  Sparkle,
  ArrowRight,
  Plus,
  MagnifyingGlass,
  Bell,
  Heart,
  ListBullets,
  SquaresFour,
  CalendarBlank,
  PlusCircle,
  Microphone,
  Waveform,
  Warning,
  WarningOctagon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { ButtonPrimary } from "./ButtonPrimary";
import { ButtonSecondary, type ButtonSecondaryProps, type ForceState } from "./ButtonSecondary";
import { ButtonGhost } from "./ButtonGhost";
import { ButtonDestructive } from "./ButtonDestructive";
import { IconButton, type IconButtonVariant } from "./IconButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SegmentSelector } from "./SegmentSelector";
import { Badge, type BadgeHue } from "./Badge";
import { TextField } from "./TextField";
import { Select, type SelectOption } from "./Select";
import { InstallCommand, type PackageManager } from "./InstallCommand";
import { ChatBubble, type ChatBubbleVariant } from "./ChatBubble";
import { TraceCard } from "./TraceCard";
import { GateCard, type GateViolation } from "./GateCard";
import { ChatComposer } from "./ChatComposer";
import { ChatThread } from "./ChatThread";
import type { ComponentSpec, ControlValues } from "./types";

/**
 * The Broadsheet component manifest. Each spec declares a controls schema that
 * the showcase sandbox turns into a sidebar and that the a11y + focus guards
 * iterate. Adding a marketing component is one entry here.
 */

const STATES = ["default", "hover", "pressed", "focus", "disabled", "loading"] as const;

/** Map a single "state" control to the component's visual props. */
function fromState(state: string): {
  forceState?: ForceState;
  disabled: boolean;
  loading: boolean;
} {
  return {
    forceState:
      state === "hover" || state === "pressed" || state === "focus"
        ? (state as ForceState)
        : undefined,
    disabled: state === "disabled",
    loading: state === "loading",
  };
}

const FIELD_STATES = ["default", "hover", "focus", "disabled", "invalid"] as const;

/** Map a single "state" control to a field's visual props (fields never load). */
function fromFieldState(state: string): {
  forceState?: ForceState;
  disabled: boolean;
  invalid: boolean;
} {
  return {
    forceState: state === "hover" || state === "focus" ? (state as ForceState) : undefined,
    disabled: state === "disabled",
    invalid: state === "invalid",
  };
}

const GLYPHS: Record<string, PhosphorIcon> = {
  plus: Plus,
  search: MagnifyingGlass,
  bell: Bell,
  heart: Heart,
};

/**
 * The text buttons (primary/secondary/ghost/destructive) share one prop shape
 * and one controls schema — only the component differs. One factory keeps them
 * in lockstep so a new variant is a single REGISTRY line.
 */
function textButtonSpec(
  id: string,
  name: string,
  Button: ComponentType<ButtonSecondaryProps>,
): ComponentSpec {
  return {
    id,
    name,
    controls: [
      { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { key: "state", label: "State", type: "select", options: [...STATES], default: "default" },
      { key: "label", label: "Label", type: "text", default: "Button" },
      { key: "iconLeft", label: "Left icon", type: "boolean", default: true },
      { key: "iconRight", label: "Right icon", type: "boolean", default: false },
    ],
    render: (v: ControlValues) => {
      const { forceState, disabled, loading } = fromState(String(v.state));
      return (
        <Button
          size={v.size as "sm" | "md" | "lg"}
          forceState={forceState}
          disabled={disabled}
          loading={loading}
          iconLeft={v.iconLeft ? <Sparkle weight="bold" /> : undefined}
          iconRight={v.iconRight ? <ArrowRight weight="bold" /> : undefined}
        >
          {String(v.label)}
        </Button>
      );
    },
  };
}

/** The icon button's four variants — one card, a Variant control (the Badge pattern). */
const ICON_BUTTON_VARIANTS = ["secondary", "primary", "ghost", "destructive"] as const;

const iconButtonSpec: ComponentSpec = {
  id: "icon-button",
  name: "Button / Icon",
  controls: [
    {
      key: "variant",
      label: "Variant",
      type: "select",
      options: [...ICON_BUTTON_VARIANTS],
      default: "secondary",
    },
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    { key: "state", label: "State", type: "select", options: [...STATES], default: "default" },
    {
      key: "icon",
      label: "Icon",
      type: "select",
      options: ["plus", "search", "bell", "heart"],
      default: "plus",
    },
    { key: "label", label: "Accessible label", type: "text", default: "Add item" },
  ],
  render: (v: ControlValues) => {
    const { forceState, disabled, loading } = fromState(String(v.state));
    const Glyph = GLYPHS[String(v.icon)] ?? Plus;
    return (
      <IconButton
        variant={v.variant as IconButtonVariant}
        size={v.size as "sm" | "md" | "lg"}
        forceState={forceState}
        disabled={disabled}
        loading={loading}
        icon={<Glyph weight="bold" />}
        label={String(v.label)}
      />
    );
  },
};

const themeSwitcherSpec: ComponentSpec = {
  id: "theme-switcher",
  name: "Theme Switcher",
  controls: [
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
  ],
  // The switcher is genuinely live — its "state" is the real theme, so clicking
  // a segment flips the whole showcase. No preview/forceState prop is needed.
  render: (v: ControlValues) => <ThemeSwitcher size={v.size as "sm" | "md" | "lg"} />,
};

/** The demo segments — one glyph each so the icons toggle has something to show. */
const SEGMENT_ITEMS = [
  { value: "list", label: "List", Icon: ListBullets },
  { value: "board", label: "Board", Icon: SquaresFour },
  { value: "timeline", label: "Timeline", Icon: CalendarBlank },
] as const;

const segmentSelectorSpec: ComponentSpec = {
  id: "segment-selector",
  name: "Segment Selector",
  controls: [
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    {
      key: "selected",
      label: "Selected",
      type: "select",
      options: SEGMENT_ITEMS.map((item) => item.value),
      default: "list",
    },
    { key: "icons", label: "Left icons", type: "boolean", default: true },
  ],
  // Uncontrolled + a `key` off the controls: changing the sidebar remounts with
  // the new initial value, while clicking a segment stays live within a mount.
  render: (v: ControlValues) => {
    const items = SEGMENT_ITEMS.map(({ value, label, Icon }) => ({
      value,
      label,
      icon: v.icons ? <Icon weight="bold" /> : undefined,
    }));
    return (
      <SegmentSelector
        key={`${String(v.selected)}-${String(v.icons)}`}
        aria-label="View"
        size={v.size as "sm" | "md" | "lg"}
        defaultValue={String(v.selected)}
        items={items}
      />
    );
  },
};

/** The 12 agnostic badge hues — color names, not meanings. */
const BADGE_COLORS: readonly BadgeHue[] = [
  "gray",
  "red",
  "orange",
  "amber",
  "yellow",
  "green",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "pink",
];

const badgeSpec: ComponentSpec = {
  id: "badge",
  name: "Badge",
  controls: [
    { key: "color", label: "Color", type: "select", options: [...BADGE_COLORS], default: "blue" },
    { key: "variant", label: "Variant", type: "select", options: ["solid", "soft"], default: "solid" },
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    { key: "icon", label: "Icon", type: "boolean", default: true },
    { key: "label", label: "Label", type: "text", default: "Badge" },
  ],
  render: (v: ControlValues) => (
    <Badge
      color={v.color as BadgeHue}
      variant={v.variant as "solid" | "soft"}
      size={v.size as "sm" | "md" | "lg"}
      icon={v.icon ? <Sparkle weight="bold" /> : undefined}
    >
      {String(v.label)}
    </Badge>
  ),
};

const textFieldSpec: ComponentSpec = {
  id: "text-field",
  name: "Text Field",
  controls: [
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    { key: "state", label: "State", type: "select", options: [...FIELD_STATES], default: "default" },
    { key: "label", label: "Label", type: "text", default: "Email" },
    { key: "placeholder", label: "Placeholder", type: "text", default: "you@company.com" },
    { key: "helper", label: "Helper text", type: "text", default: "We'll never share your email." },
  ],
  render: (v: ControlValues) => {
    const { forceState, disabled, invalid } = fromFieldState(String(v.state));
    return (
      <TextField
        size={v.size as "sm" | "md" | "lg"}
        label={String(v.label)}
        placeholder={String(v.placeholder)}
        helperText={String(v.helper)}
        errorText="Enter a valid email address."
        invalid={invalid}
        disabled={disabled}
        forceState={forceState}
      />
    );
  },
};

/** Demo options for the Select — a framework picker with one glyph each. */
const SELECT_OPTIONS: readonly SelectOption[] = [
  { value: "next", label: "Next.js", icon: <SquaresFour weight="bold" /> },
  { value: "remix", label: "Remix", icon: <ListBullets weight="bold" /> },
  { value: "astro", label: "Astro", icon: <Sparkle weight="bold" /> },
  { value: "svelte", label: "SvelteKit", icon: <CalendarBlank weight="bold" /> },
];

const selectSpec: ComponentSpec = {
  id: "select",
  name: "Select",
  controls: [
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    {
      key: "value",
      label: "Selected",
      type: "select",
      options: SELECT_OPTIONS.map((option) => option.value),
      default: "next",
    },
    { key: "state", label: "State", type: "select", options: [...FIELD_STATES], default: "default" },
    { key: "open", label: "Open (preview)", type: "boolean", default: false },
    { key: "label", label: "Label", type: "text", default: "Framework" },
    { key: "icons", label: "Icons", type: "boolean", default: true },
  ],
  // `key` off the controls remounts so defaultValue/defaultOpen reseed, while a
  // click stays live within a mount (the SegmentSelector pattern).
  render: (v: ControlValues) => {
    const { forceState, disabled, invalid } = fromFieldState(String(v.state));
    const options = SELECT_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      icon: v.icons ? option.icon : undefined,
    }));
    return (
      <Select
        key={`${String(v.value)}-${String(v.icons)}`}
        size={v.size as "sm" | "md" | "lg"}
        label={String(v.label)}
        options={options}
        defaultValue={String(v.value)}
        invalid={invalid}
        disabled={disabled}
        forceState={forceState}
        defaultOpen={Boolean(v.open) && !disabled}
      />
    );
  },
};

const installCommandSpec: ComponentSpec = {
  id: "install-command",
  name: "Install Command",
  controls: [
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    {
      key: "packages",
      label: "Packages",
      type: "text",
      default:
        "@sina-design-system/theme @sina-design-system/core @sina-design-system/fintech @sina-design-system/fintech-react @sina-design-system/governance",
    },
    {
      key: "manager",
      label: "Manager",
      type: "select",
      options: ["npm", "pnpm", "yarn", "bun"],
      default: "npm",
    },
    { key: "comingSoon", label: "Coming soon", type: "boolean", default: false },
  ],
  render: (v: ControlValues) => {
    const pkgs = String(v.packages).split(/\s+/).filter(Boolean);
    return (
      <InstallCommand
        key={`${String(v.manager)}-${String(v.size)}`}
        size={v.size as "sm" | "md" | "lg"}
        packages={pkgs.length ? pkgs : ["@sina/core"]}
        defaultManager={v.manager as PackageManager}
        comingSoon={Boolean(v.comingSoon)}
      />
    );
  },
};

const chatBubbleSpec: ComponentSpec = {
  id: "chat-bubble",
  name: "Chat / Bubble",
  controls: [
    {
      key: "variant",
      label: "Variant",
      type: "select",
      options: ["user", "outcome"],
      default: "user",
    },
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    {
      key: "text",
      label: "Text",
      type: "text",
      default: "Show me my last 2 transactions.",
    },
  ],
  render: (v: ControlValues) => (
    <ChatBubble variant={v.variant as ChatBubbleVariant} size={v.size as "sm" | "md" | "lg"}>
      <p>{String(v.text)}</p>
    </ChatBubble>
  ),
};

const TRACE_SAMPLE_JSON = [
  "{",
  '  "intent": "wire_transfer",',
  '  "props": {',
  '    "amount": 6000000,',
  '    "currency": "USD"',
  "  }",
  "}",
].join("\n");

const traceCardSpec: ComponentSpec = {
  id: "trace-card",
  name: "Chat / Trace Card",
  controls: [
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    { key: "kicker", label: "Kicker", type: "text", default: "Under the hood" },
    { key: "verb", label: "Intent verb", type: "text", default: "wire_transfer" },
    {
      key: "summary",
      label: "Summary",
      type: "text",
      default: "A fully formed wire, above the approval limit.",
    },
    { key: "code", label: "Show payload", type: "boolean", default: true },
  ],
  render: (v: ControlValues) => (
    <TraceCard
      size={v.size as "sm" | "md" | "lg"}
      kicker={String(v.kicker)}
      verb={String(v.verb)}
      summary={String(v.summary)}
      code={v.code ? TRACE_SAMPLE_JSON : undefined}
    />
  ),
};

const GATE_SAMPLE_VIOLATIONS: readonly GateViolation[] = [
  {
    code: "AMOUNT_REQUIRES_APPROVAL",
    severity: "escalate",
    message: "A wire above the limit requires secondary managerial approval.",
    standard: "SINA dual control: secondary approval",
  },
  {
    code: "CTR_REPORTABLE",
    severity: "flag",
    message: "A Currency Transaction Report applies.",
    standard: "31 CFR 1010.311",
  },
];

const GATE_STATUSES = ["checking", "pass", "escalate", "reject"] as const;

const gateCardSpec: ComponentSpec = {
  id: "gate-card",
  name: "Chat / Gate Card",
  controls: [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [...GATE_STATUSES],
      default: "pass",
    },
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    { key: "kicker", label: "Kicker", type: "text", default: "The gate" },
    { key: "violations", label: "Violations", type: "boolean", default: false },
    { key: "mount", label: "Mount", type: "text", default: "TransactionList" },
    { key: "meta", label: "Meta", type: "text", default: "12 ms · simulated" },
  ],
  render: (v: ControlValues) => {
    const status = v.status as (typeof GATE_STATUSES)[number];
    const shared = {
      size: v.size as "sm" | "md" | "lg",
      kicker: String(v.kicker),
      mount: String(v.mount) || undefined,
      meta: String(v.meta) || undefined,
      violations: v.violations ? GATE_SAMPLE_VIOLATIONS : undefined,
    };
    // The bold status glyph is mandatory for escalate/reject and always comes
    // from the caller (here, the spec) — the error-warning-icon convention.
    if (status === "escalate") {
      return <GateCard {...shared} status="escalate" statusIcon={<Warning weight="bold" />} />;
    }
    if (status === "reject") {
      return (
        <GateCard {...shared} status="reject" statusIcon={<WarningOctagon weight="bold" />} />
      );
    }
    return <GateCard {...shared} status={status} />;
  },
};

const chatComposerSpec: ComponentSpec = {
  id: "chat-composer",
  name: "Chat / Composer",
  controls: [
    { key: "size", label: "Size", type: "select", options: ["sm", "md", "lg"], default: "md" },
    { key: "text", label: "Typed text", type: "text", default: "Wire $60,000 from Acme Corp" },
    { key: "caret", label: "Caret", type: "boolean", default: true },
    { key: "placeholder", label: "Placeholder", type: "text", default: "Ask for anything" },
    { key: "leading", label: "Leading glyph", type: "boolean", default: true },
    { key: "voice", label: "Voice glyph", type: "boolean", default: true },
  ],
  render: (v: ControlValues) => (
    <ChatComposer
      size={v.size as "sm" | "md" | "lg"}
      text={String(v.text)}
      caret={Boolean(v.caret)}
      placeholder={String(v.placeholder)}
      leadingIcon={v.leading ? <PlusCircle weight="fill" /> : undefined}
      trailingIcon={v.voice ? <Microphone weight="fill" /> : undefined}
      sendIcon={<Waveform weight="bold" />}
      sendLabel="Send"
    />
  ),
};

const chatThreadSpec: ComponentSpec = {
  id: "chat-thread",
  name: "Chat / Thread",
  controls: [
    {
      key: "size",
      label: "Size",
      type: "select",
      options: ["sm", "md", "lg", "fill"],
      default: "md",
    },
    { key: "gate", label: "Gate card", type: "boolean", default: true },
  ],
  render: (v: ControlValues) => (
    <ChatThread size={v.size as "sm" | "md" | "lg" | "fill"} aria-label="Demo conversation">
      <ChatBubble variant="user" size="sm">
        <p>Show me my last 2 transactions.</p>
      </ChatBubble>
      {v.gate ? (
        <GateCard size="sm" kicker="The gate" status="pass" mount="TransactionList" />
      ) : null}
      <ChatBubble variant="outcome" size="sm">
        <p>Two transactions for XYZ Company, mounted from validated intent.</p>
      </ChatBubble>
    </ChatThread>
  ),
};

export const REGISTRY: readonly ComponentSpec[] = [
  textButtonSpec("button-primary", "Button / Primary", ButtonPrimary),
  textButtonSpec("button-secondary", "Button / Secondary", ButtonSecondary),
  textButtonSpec("button-ghost", "Button / Ghost", ButtonGhost),
  textButtonSpec("button-destructive", "Button / Destructive", ButtonDestructive),
  iconButtonSpec,
  themeSwitcherSpec,
  segmentSelectorSpec,
  badgeSpec,
  textFieldSpec,
  selectSpec,
  installCommandSpec,
  chatBubbleSpec,
  traceCardSpec,
  gateCardSpec,
  chatComposerSpec,
  chatThreadSpec,
];
