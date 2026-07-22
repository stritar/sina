import { Icon } from "@sina-design-system/core";
import type { IconWeight } from "@phosphor-icons/react";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Demo, Matrix, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const SIZES = ["16", "20", "24", "32"] as const;
const WEIGHTS = ["regular", "bold", "fill", "duotone"] as const;
const COLORS = [
  { className: styles.textDefault, label: "text" },
  { className: styles.textDanger, label: "danger" },
  { className: styles.textSuccess, label: "success" },
  { className: styles.textWarning, label: "warning" },
  { className: styles.textInfo, label: "info" },
] as const;

export default function IconStory() {
  return (
    <StoryShell title="Icon">
      <Matrix
        label="size × weight"
        rows={SIZES.map((s) => ({ key: s, label: `${s}px` }))}
        cols={WEIGHTS.map((w) => ({ key: w, label: w }))}
        render={(size, weight) => (
          <Icon
            icon={ShieldCheck}
            size={Number(size)}
            weight={weight as IconWeight}
            decorative
          />
        )}
      />

      <Demo label="Labeled vs decorative">
        <Icon icon={ShieldCheck} label="Secure" size={24} />
        <Icon icon={ShieldCheck} decorative size={24} />
      </Demo>

      <Demo label="Color · via text-* tokens (currentColor)">
        {COLORS.map((c) => (
          <Icon
            key={c.label}
            icon={ShieldCheck}
            decorative
            size={24}
            className={c.className}
          />
        ))}
      </Demo>
    </StoryShell>
  );
}
