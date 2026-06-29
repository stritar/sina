import { Button, type ButtonProps } from "@sina-design-system/core";
import { ArrowRight, Plus, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Demo, Matrix, StoryShell } from "../_components/StoryShell";

const VARIANTS = ["primary", "secondary", "danger", "ghost"] as const;
const SIZES = ["sm", "md", "lg", "xl"] as const;
const SIZE_LABELS: Record<(typeof SIZES)[number], string> = {
  sm: "sm 24",
  md: "md 28",
  lg: "lg 32",
  xl: "xl 40",
};
const STATES = [
  { key: "default", label: "default" },
  { key: "loading", label: "loading" },
  { key: "disabled", label: "disabled" },
] as const;

export default function ButtonStory() {
  return (
    <StoryShell title="Button">
      <Demo label="Variants">
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Demo>

      <Demo label="Sizes · sm 24 / md 28 / lg 32 / xl 40">
        {SIZES.map((size) => (
          <Button key={size} size={size}>
            {SIZE_LABELS[size]}
          </Button>
        ))}
      </Demo>

      <Matrix
        label="variant × size"
        rows={VARIANTS.map((v) => ({ key: v, label: v }))}
        cols={SIZES.map((s) => ({ key: s, label: s }))}
        render={(variant, size) => (
          <Button
            variant={variant as ButtonProps["variant"]}
            size={size as ButtonProps["size"]}
          >
            Go
          </Button>
        )}
      />

      <Matrix
        label="variant × state"
        rows={VARIANTS.map((v) => ({ key: v, label: v }))}
        cols={STATES.map((s) => ({ key: s.key, label: s.label }))}
        render={(variant, state) => (
          <Button
            variant={variant as ButtonProps["variant"]}
            loading={state === "loading"}
            disabled={state === "disabled"}
          >
            Go
          </Button>
        )}
      />

      <Demo label="Icons · left / right / both / icon-only at each size">
        <Button iconLeft={<ShieldCheck weight="fill" />}>Leading</Button>
        <Button variant="secondary" iconRight={<ArrowRight weight="bold" />}>
          Trailing
        </Button>
        <Button iconLeft={<ShieldCheck weight="fill" />} iconRight={<ArrowRight weight="bold" />}>
          Both
        </Button>
        {SIZES.map((size) => (
          <Button key={size} size={size} aria-label="Add item" iconLeft={<Plus weight="bold" />} />
        ))}
      </Demo>

      <Demo label="asChild · renders any element with button styling">
        <Button asChild>
          <a href="/primitives">As link</a>
        </Button>
      </Demo>
    </StoryShell>
  );
}
