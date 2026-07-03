/**
 * @sina-design-system/core
 *
 * Headless, fully accessible UI primitives (Dialog, CurrencyField, …) built on
 * Radix UI and styled via @sina-design-system/theme. Strictly domain-agnostic:
 * no Fintech (or any vertical) business logic lives here.
 */

// Utilities — a11y substrate
export { VisuallyHidden } from "./VisuallyHidden/VisuallyHidden.js";
export type { VisuallyHiddenProps } from "./VisuallyHidden/VisuallyHidden.js";
export { Icon } from "./Icon/Icon.js";
export type { IconProps } from "./Icon/Icon.js";

// Tier 1 primitives
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./Dialog/Dialog.js";
export { Button, buttonVariants } from "./Button/Button.js";
export type { ButtonProps } from "./Button/Button.js";
export { Field } from "./Field/Field.js";
export type { FieldProps, FieldControlProps } from "./Field/Field.js";
export { CurrencyField } from "./CurrencyField/CurrencyField.js";
export type { CurrencyFieldProps } from "./CurrencyField/CurrencyField.js";
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "./Select/Select.js";
export { Alert } from "./Alert/Alert.js";
export type { AlertProps, AlertVariant } from "./Alert/Alert.js";

// Tier 2 primitives
export { Stack } from "./Stack/Stack.js";
export type { StackProps, GapStep } from "./Stack/Stack.js";
export { Grid } from "./Grid/Grid.js";
export type { GridProps, GridCols } from "./Grid/Grid.js";
export { Badge, badgeVariants } from "./Badge/Badge.js";
export type { BadgeProps } from "./Badge/Badge.js";
export { Spinner } from "./Spinner/Spinner.js";
export type { SpinnerProps } from "./Spinner/Spinner.js";
export { Progress } from "./Progress/Progress.js";
export type { ProgressProps } from "./Progress/Progress.js";
export { Chart } from "./Chart/Chart.js";
export type { ChartProps, ChartVariant } from "./Chart/Chart.js";
export { SummaryList } from "./SummaryList/SummaryList.js";
export type { SummaryListProps, SummaryItem } from "./SummaryList/SummaryList.js";
export { TextField } from "./TextField/TextField.js";
export type { TextFieldProps } from "./TextField/TextField.js";
export { Checkbox } from "./Checkbox/Checkbox.js";
export type { CheckboxProps } from "./Checkbox/Checkbox.js";
export { CredentialField, CredentialOTP } from "./CredentialField/CredentialField.js";
export type { CredentialFieldProps, CredentialOTPProps } from "./CredentialField/CredentialField.js";

// Tier 3 primitives
export { Separator } from "./Separator/Separator.js";
export { RadioGroup, RadioGroupItem } from "./RadioGroup/RadioGroup.js";
export type { RadioGroupItemProps } from "./RadioGroup/RadioGroup.js";
export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./Tooltip/Tooltip.js";
export { ScrollArea } from "./ScrollArea/ScrollArea.js";
export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  toastVariants,
} from "./Toast/Toast.js";
export type { ToastProps } from "./Toast/Toast.js";
export { Combobox } from "./Combobox/Combobox.js";
export type { ComboboxProps, ComboboxOption } from "./Combobox/Combobox.js";
