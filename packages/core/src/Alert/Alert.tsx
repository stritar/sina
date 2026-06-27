/**
 * @sina-design-system/core — Alert
 *
 * Inline status banner. Role-based (no Radix): `role="alert"` for danger
 * (assertive) and `role="status"` otherwise (polite). Conveys meaning by icon +
 * text + role — never color alone — so it stays accessible and is the substrate
 * the Phase-4 blocked state composes from. Domain-agnostic: neutral intents only,
 * no governance vocabulary baked in.
 */
import { WarningCircle, CheckCircle, Info, Warning } from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export type AlertVariant = "info" | "success" | "warning" | "danger";

interface VariantConfig {
  role: "status" | "alert";
  icon: PhosphorIcon;
  container: string;
  iconColor: string;
}

const VARIANTS: Record<AlertVariant, VariantConfig> = {
  info: {
    role: "status",
    icon: Info,
    container: "border-info/40 bg-info-bg",
    iconColor: "text-info",
  },
  success: {
    role: "status",
    icon: CheckCircle,
    container: "border-success/40 bg-success-bg",
    iconColor: "text-success",
  },
  warning: {
    role: "status",
    icon: Warning,
    container: "border-warning/40 bg-warning-bg",
    iconColor: "text-warning",
  },
  danger: {
    role: "alert",
    icon: WarningCircle,
    container: "border-danger/40 bg-danger-bg",
    iconColor: "text-danger",
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
      className={cn("flex items-start gap-2.5 rounded-md border p-3", config.container, className)}
    >
      {Glyph ? (
        <Glyph aria-hidden weight="fill" className={cn("size-5 shrink-0", config.iconColor)} />
      ) : null}
      <div className="flex flex-col gap-1">
        {title ? <p className="text-ui font-medium text-text">{title}</p> : null}
        {children ? <div className="text-ui text-text-muted">{children}</div> : null}
      </div>
    </div>
  );
}
