"use client";

/**
 * CodeBlock — the console's atom. A line-numbered, syntax-highlighted, copyable
 * code panel modeled on the "See all variables" reference: muted gutter, warm
 * header with a Copy→Copied affordance, and a "See all" expansion that opens the
 * full content in the same modal shape. Domain-agnostic (JSON / plain text) — a
 * future `core` primitive; app-local for now.
 */

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@sina-design-system/core";
import {
  CaretDown,
  Check,
  Copy as CopyIcon,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { tokenizeJsonLine, type Scope } from "./highlight";
import styles from "./CodeBlock.module.css";

const SCOPE_CLASS: Record<Scope, string | undefined> = {
  key: styles.scopeKey,
  string: styles.scopeString,
  number: styles.scopeNumber,
  boolean: styles.scopeBoolean,
  punctuation: styles.scopePunctuation,
  plain: styles.scopePlain,
};

export interface CodeBlockProps {
  code: string;
  language?: "json" | "text";
  /** Header label, e.g. `intent · proposeWireTransfer`. Omit to hide the header. */
  title?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  /** Collapse to this many lines with a "See all" expansion when longer. */
  maxLines?: number;
  className?: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      iconLeft={
        copied ? <Check className={styles.icon} /> : <CopyIcon className={styles.icon} />
      }
      onClick={() => {
        void navigator.clipboard?.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      <span className={styles.monoLabel}>{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

/** The gutter + code grid — shared by the inline panel and the "See all" modal. */
function CodeView({
  lines,
  language,
  showLineNumbers,
}: {
  lines: string[];
  language: "json" | "text";
  showLineNumbers: boolean;
}) {
  return (
    <div className={styles.scroll}>
      <div className={styles.grid}>
        {lines.map((line, index) => {
          const tokens = language === "json" ? tokenizeJsonLine(line) : [{ text: line, scope: "plain" as Scope }];
          return (
            <div key={index} className={styles.line}>
              {showLineNumbers && (
                <span
                  aria-hidden
                  className={styles.gutter}
                  style={{ minWidth: "2.5ch" }}
                >
                  {index + 1}
                </span>
              )}
              <code className={styles.code}>
                {tokens.map((token, t) => (
                  <span key={t} className={SCOPE_CLASS[token.scope]}>
                    {token.text}
                  </span>
                ))}
                {line.length === 0 ? " " : null}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CodeBlock({
  code,
  language = "json",
  title,
  showLineNumbers = true,
  showCopy = true,
  maxLines,
  className,
}: CodeBlockProps) {
  const [open, setOpen] = useState(false);
  const lines = code.split("\n");
  const collapsed = maxLines != null && lines.length > maxLines;
  const visibleLines = collapsed ? lines.slice(0, maxLines) : lines;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {(title || showCopy) && (
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {showCopy && <CopyButton code={code} />}
        </div>
      )}

      <div className={styles.body}>
        <CodeView lines={visibleLines} language={language} showLineNumbers={showLineNumbers} />
        {collapsed && (
          <div
            aria-hidden
            className={styles.fade}
            style={{
              background: "linear-gradient(to top, var(--sina-color-surface-sunken), transparent)",
            }}
          />
        )}
      </div>

      {collapsed && (
        <div className={styles.seeAll}>
          <Button
            variant="ghost"
            size="sm"
            iconRight={<CaretDown className={styles.icon} />}
            onClick={() => setOpen(true)}
          >
            <span className={styles.monoLabel}>See all · {lines.length} lines</span>
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <DialogTitle className={styles.dialogTitle}>{title ?? "See all"}</DialogTitle>
            <div className={styles.dialogActions}>
              {showCopy && <CopyButton code={code} />}
              <DialogClose asChild>
                <Button variant="ghost" size="sm" aria-label="Close">
                  <X className={styles.icon} />
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className={styles.dialogBody}>
            <CodeView lines={lines} language={language} showLineNumbers={showLineNumbers} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
