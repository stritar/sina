"use client";

import { type MouseEvent as ReactMouseEvent, useEffect, useId, useRef, useState } from "react";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import { Select, type SelectOption } from "./Select";
import styles from "./InstallCommand.module.css";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/** Install verb per manager: npm installs, the rest add. */
const VERB: Record<PackageManager, string> = {
  npm: "install",
  pnpm: "add",
  yarn: "add",
  bun: "add",
};

export type InstallCommandProps = {
  /** The packages to install, e.g. ["@sina/core", "@sina/fintech"]. */
  packages: readonly string[];
  /** Which managers appear in the dropdown. Defaults to all four. */
  managers?: readonly PackageManager[];
  /** Initial selected manager; defaults to the first available. */
  defaultManager?: PackageManager;
  /**
   * Marks the packages as unreleased: the tooltip turns amber and announces the
   * state instead of offering a copy, and copying is switched off so nobody
   * walks away with an install line for something that is not on the registry.
   */
  comingSoon?: boolean;
  /** Tooltip text when `comingSoon` is set. */
  comingSoonLabel?: string;
  size?: ButtonSize;
  className?: string;
};

/**
 * Broadsheet install command block: a lighter sage card whose `npm install …`
 * command wraps across lines directly on the surface (no inner well), with the
 * package-manager dropdown pinned top-right (Select with `tone="primary"`). The
 * whole command is the copy control: clicking it writes the exact command to the
 * clipboard, a "click to copy" tooltip shows on hover/focus (flipping to
 * "Copied!"), and the result is announced via a polite live region.
 *
 * With `comingSoon`, the card looks unchanged but the tooltip carries the state:
 * it turns amber and reads "Coming soon" in place of "click to copy", and the
 * copy itself plus the manager dropdown go inert.
 */
export function InstallCommand({
  packages,
  managers = ["npm", "pnpm", "yarn", "bun"],
  defaultManager,
  comingSoon = false,
  comingSoonLabel = "Coming soon",
  size = "md",
  className,
}: InstallCommandProps) {
  const available = managers.length > 0 ? managers : (["npm"] as const);
  const [manager, setManager] = useState<PackageManager>(
    defaultManager && available.includes(defaultManager) ? defaultManager : available[0]!,
  );
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  /** Track the pointer in `.root`'s coordinate space so the tooltip can follow it. */
  function trackCursor(event: ReactMouseEvent) {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) setCoords({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  const command = `${manager} ${VERB[manager]} ${packages.join(" ")}`;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function copy() {
    // Unreleased packages are not copyable; the card is a placeholder only.
    if (comingSoon) return;
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // Clipboard can reject (permissions / insecure context); still flash the
      // confirmation so the control stays responsive.
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  }

  const options: SelectOption[] = available.map((m) => ({ value: m, label: m }));

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, className)}
      data-size={size}
      data-coming-soon={comingSoon || undefined}
    >
      <button
        type="button"
        data-broadsheet=""
        className={styles.command}
        // Stays focusable so keyboard users still reach and hear the state; the
        // handlers below are what make it inert, not `disabled`.
        aria-disabled={comingSoon || undefined}
        aria-describedby={tooltipId}
        onClick={copy}
        onMouseEnter={(event) => {
          setOpen(true);
          trackCursor(event);
        }}
        onMouseMove={trackCursor}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <code className={styles.code}>
          <span className={styles.prefix}>{manager} </span>
          {`${VERB[manager]} ${packages.join(" ")}`}
        </code>
      </button>
      <span
        role="tooltip"
        id={tooltipId}
        className={styles.tooltip}
        data-open={open || undefined}
        data-coming-soon={comingSoon || undefined}
        style={
          coords
            ? {
                left: coords.x,
                top: coords.y,
                right: "auto",
                bottom: "auto",
                transform: "translate(-50%, calc(-100% - 12px))",
              }
            : undefined
        }
      >
        {comingSoon ? comingSoonLabel : copied ? "Copied!" : "click to copy"}
      </span>
      <div className={styles.managerSlot}>
        <Select
          size={size}
          tone="primary"
          aria-label="Package manager"
          options={options}
          value={manager}
          onValueChange={(value) => setManager(value as PackageManager)}
        />
      </div>
      <span className={styles.srOnly} aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
