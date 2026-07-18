import {
  Sparkle,
  ArrowRight,
  Plus,
  MagnifyingGlass,
  Bell,
  Heart,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { ButtonPrimary } from "./ButtonPrimary";
import { ButtonSecondary, type ButtonSecondaryProps, type ForceState } from "./ButtonSecondary";
import { ButtonGhost } from "./ButtonGhost";
import { ButtonDestructive } from "./ButtonDestructive";
import { IconButton } from "./IconButton";
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

const iconButtonSpec: ComponentSpec = {
  id: "icon-button",
  name: "Button / Icon",
  controls: [
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

export const REGISTRY: readonly ComponentSpec[] = [
  textButtonSpec("button-primary", "Button / Primary", ButtonPrimary),
  textButtonSpec("button-secondary", "Button / Secondary", ButtonSecondary),
  textButtonSpec("button-ghost", "Button / Ghost", ButtonGhost),
  textButtonSpec("button-destructive", "Button / Destructive", ButtonDestructive),
  iconButtonSpec,
];
