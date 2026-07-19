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
 */
export function InstallCommand({
  packages,
  managers = ["npm", "pnpm", "yarn", "bun"],
  defaultManager,
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
    <div ref={rootRef} className={cn(styles.root, className)} data-size={size}>
      <button
        type="button"
        data-broadsheet=""
        className={styles.command}
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
        {copied ? "Copied!" : "click to copy"}
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
