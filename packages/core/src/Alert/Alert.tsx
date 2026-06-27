/**
 * @sina-design-system/core — Alert
 *
 * Inline status banner. Role-based (no Radix): `role="alert"` for danger
 * (assertive) and `role="status"` otherwise (polite). Conveys meaning by icon +
 * text + role — never color alone — so it stays accessible and is the substrate
 * the Phase-4 blocked state composes from. Domain-agnostic: neutral intents only,
 * no governance vocabulary baked in.
 */
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export type AlertVariant = "info" | "success" | "warning" | "danger";

interface VariantConfig {
  role: "status" | "alert";
  icon: LucideIcon;
  container: string;
  iconColor: string;
}

const VARIANTS: Record<AlertVariant, VariantConfig> = {
  info: {
    role: "status",
    icon: Info,
    container: "border-info/30 bg-info-bg",
    iconColor: "text-info",
  },
  success: {
    role: "status",
    icon: CircleCheck,
    container: "border-success/30 bg-success-bg",
    iconColor: "text-success",
  },
  warning: {
    role: "status",
    icon: TriangleAlert,
    container: "border-warning/30 bg-warning-bg",
    iconColor: "text-warning",
  },
  danger: {
    role: "alert",
    icon: CircleAlert,
    container: "border-danger/30 bg-danger-bg",
    iconColor: "text-danger",
  },
};

export interface AlertProps {
  variant?: AlertVariant;
  /** Optional bold heading line. */
  title?: ReactNode;
  children?: ReactNode;
  /** Override the default intent icon, or pass `false` to omit it. */
  icon?: LucideIcon | false;
  className?: string;
}

export function Alert({ variant = "info", title, children, icon, className }: AlertProps) {
  const config = VARIANTS[variant];
  const Glyph = icon === false ? null : (icon ?? config.icon);

  return (
    <div
      role={config.role}
      className={cn("flex items-start gap-3 rounded-lg border p-4", config.container, className)}
    >
      {Glyph ? (
        <Glyph aria-hidden className={cn("size-control-sm shrink-0", config.iconColor)} />
      ) : null}
      <div className="flex flex-col gap-1">
        {title ? <p className="font-medium text-text">{title}</p> : null}
        {children ? <div className="text-sm text-text-muted">{children}</div> : null}
      </div>
    </div>
  );
}
