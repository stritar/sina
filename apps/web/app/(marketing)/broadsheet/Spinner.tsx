import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { cn } from "./cn";
import styles from "./Spinner.module.css";

/**
 * Shared loading spinner for Broadsheet components. Sizing comes from the host
 * button's icon slot (the `.slot svg` rule), so this only owns the spin.
 */
export function Spinner({ className }: { className?: string }) {
  return <CircleNotch weight="bold" aria-hidden="true" className={cn(styles.spin, className)} />;
}
