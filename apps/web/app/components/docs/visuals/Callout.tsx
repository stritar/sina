import type { ReactNode } from "react";
import { Glyph, type GlyphName } from "./Glyph";
import { cx } from "./cx";
import styles from "./Callout.module.css";

/**
 * A subtle, semantic callout box for the docs. Six intents, each with a bold
 * status glyph carried by the SINA convention (the meaning is in the glyph +
 * text, never colour alone). Kept lean — a thin left accent, not a vivid banner —
 * so the reading flow stays calm. Depth still belongs in `<DeepDive>`, not here.
 */

export type CalloutVariant =
  | "note"
  | "tip"
  | "warning"
  | "danger"
  | "enforced"
  | "governance";

const META: Record<CalloutVariant, { glyph: GlyphName; label: string }> = {
  note: { glyph: "info", label: "Note" },
  tip: { glyph: "check", label: "Tip" },
  warning: { glyph: "warning", label: "Warning" },
  danger: { glyph: "danger", label: "Warning" },
  enforced: { glyph: "lock", label: "Enforced by SINA" },
  governance: { glyph: "shield", label: "Governance" },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}) {
  const meta = META[variant];
  return (
    <div className={cx(styles.callout, styles[variant])} role="note">
      <span className={styles.icon}>
        <Glyph name={meta.glyph} size={18} />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>{title ?? meta.label}</p>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
