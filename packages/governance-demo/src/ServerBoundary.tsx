/**
 * The server-boundary marker — a small banded caption reinforcing §1b: everything
 * below it ran server-side, before any primitive was allowed to mount.
 */

import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import styles from "./ServerBoundary.module.css";

export function ServerBoundary({ className }: { className?: string }) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <ShieldCheck weight="fill" className={styles.icon} aria-hidden />
      <span className={styles.caption}>
        server-side · validated before mount
      </span>
    </div>
  );
}
