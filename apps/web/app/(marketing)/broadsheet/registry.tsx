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
import { Badge, type BadgeColor } from "./Badge";
import { TextField } from "./TextField";
import { Select, type SelectOption } from "./Select";
import { InstallCommand, type PackageManager } from "./InstallCommand";
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
const BADGE_COLORS: readonly BadgeColor[] = [
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
      color={v.color as BadgeColor}
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
  ],
  render: (v: ControlValues) => {
    const pkgs = String(v.packages).split(/\s+/).filter(Boolean);
    return (
      <InstallCommand
        key={`${String(v.manager)}-${String(v.size)}`}
        size={v.size as "sm" | "md" | "lg"}
        packages={pkgs.length ? pkgs : ["@sina/core"]}
        defaultManager={v.manager as PackageManager}
      />
    );
  },
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
];
