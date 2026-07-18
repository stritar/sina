/**
 * Broadsheet — the SINA marketing component library. Self-contained in apps/web,
 * isolated from packages/* and the core primitives. Components consume the
 * `--sinamk-*` foundation (broadsheet.css) and carry the `data-broadsheet`
 * marker that earns the global blue focus outline.
 */
export { ButtonSecondary } from "./ButtonSecondary";
export type { ButtonSecondaryProps, ButtonSize, ForceState } from "./ButtonSecondary";
export { ButtonPrimary } from "./ButtonPrimary";
export type { ButtonPrimaryProps } from "./ButtonPrimary";
export { ButtonGhost } from "./ButtonGhost";
export type { ButtonGhostProps } from "./ButtonGhost";
export { ButtonDestructive } from "./ButtonDestructive";
export type { ButtonDestructiveProps } from "./ButtonDestructive";
export { IconButton } from "./IconButton";
export type { IconButtonProps } from "./IconButton";
export { ThemeSwitcher } from "./ThemeSwitcher";
export type { ThemeSwitcherProps } from "./ThemeSwitcher";
export { SegmentSelector } from "./SegmentSelector";
export type { SegmentSelectorProps, SegmentItem } from "./SegmentSelector";
export { Badge } from "./Badge";
export type { BadgeProps, BadgeColor, BadgeVariant } from "./Badge";
export { TextField } from "./TextField";
export type { TextFieldProps } from "./TextField";
export { Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";
export { InstallCommand } from "./InstallCommand";
export type { InstallCommandProps, PackageManager } from "./InstallCommand";
export { Spinner } from "./Spinner";
export { REGISTRY } from "./registry";
export type { ComponentSpec, Control, ControlValues } from "./types";
