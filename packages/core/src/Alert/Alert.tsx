/**
 * @sina-design-system/core — Alert
 *
 * Inline status banner. Role-based (no Radix): `role="alert"` for danger
 * (assertive) and `role="status"` otherwise (polite). Conveys meaning by icon +
 * text + role — never color alone — so it stays accessible and is the substrate
 * the Phase-4 blocked state composes from. Domain-agnostic: neutral intents only,
 * no governance vocabulary baked in.
 */
import { WarningOctagon, CheckCircle, Info, Warning } from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import styles from "./Alert.module.css";

export type AlertVariant = "info" | "success" | "warning" | "danger";

interface VariantConfig {
  role: "status" | "alert";
  icon: PhosphorIcon;
  container: string | undefined;
}

const VARIANTS: Record<AlertVariant, VariantConfig> = {
  info: {
    role: "status",
    icon: Info,
    container: styles.info,
  },
  success: {
    role: "status",
    icon: CheckCircle,
    container: styles.success,
  },
  warning: {
    role: "status",
    icon: Warning,
    container: styles.warning,
  },
  danger: {
    role: "alert",
    icon: WarningOctagon,
    container: styles.danger,
  },
};

export interface AlertProps {
  variant?: AlertVariant;
  /** Optional bold heading line. */
  title?: ReactNode;
  children?: ReactNode;
  /** Override the default intent icon, or pass `false` to omit it. */
  icon?: PhosphorIcon | false;
  className?: string;
}

export function Alert({ variant = "info", title, children, icon, className }: AlertProps) {
  const config = VARIANTS[variant];
  const Glyph = icon === false ? null : (icon ?? config.icon);

  return (
    <div
      role={config.role}
      data-sina-status="alert"
      className={cn(styles.root, config.container, className)}
    >
      {Glyph ? (
        <Glyph aria-hidden weight="bold" className={styles.icon} />
      ) : null}
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.message}>{children}</div> : null}
      </div>
    </div>
  );
}
