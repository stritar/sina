"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "./cn";
import type { ButtonSize } from "./ButtonSecondary";
import { IconButton } from "./IconButton";
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
 * Broadsheet install command block: a monospace `npm install …` line with an
 * integrated package-manager dropdown (reusing Select) and a copy button
 * (reusing IconButton). Switching the manager rewrites the command; copy writes
 * the exact command to the clipboard and announces it via a polite live region.
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <div className={cn(styles.root, className)} data-size={size}>
      <code className={styles.code}>{command}</code>
      <div className={styles.managerSlot}>
        <Select
          size={size}
          aria-label="Package manager"
          options={options}
          value={manager}
          onValueChange={(value) => setManager(value as PackageManager)}
        />
      </div>
      <IconButton
        size={size}
        icon={copied ? <Check weight="bold" /> : <Copy weight="bold" />}
        label={copied ? "Copied" : "Copy command"}
        onClick={copy}
      />
      <span className={styles.srOnly} aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
