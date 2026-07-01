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

const SCOPE_CLASS: Record<Scope, string> = {
  key: "text-text",
  string: "text-success",
  number: "text-info",
  boolean: "text-warning",
  punctuation: "text-text-subtle",
  plain: "text-text",
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
        copied ? <Check className="size-control-2xs" /> : <CopyIcon className="size-control-2xs" />
      }
      onClick={() => {
        void navigator.clipboard?.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      <span className="font-mono text-xs">{copied ? "Copied" : "Copy"}</span>
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
    <div className="overflow-x-auto">
      <div className="min-w-full font-mono text-xs leading-snug">
        {lines.map((line, index) => {
          const tokens = language === "json" ? tokenizeJsonLine(line) : [{ text: line, scope: "plain" as Scope }];
          return (
            <div key={index} className="flex">
              {showLineNumbers && (
                <span
                  aria-hidden
                  className="select-none pr-4 text-right text-text-subtle"
                  style={{ minWidth: "2.5ch" }}
                >
                  {index + 1}
                </span>
              )}
              <code className="whitespace-pre text-text">
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
    <div
      className={`overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken ${className ?? ""}`}
    >
      {(title || showCopy) && (
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-1.5">
          <span className="truncate font-mono text-xs text-text-muted">{title}</span>
          {showCopy && <CopyButton code={code} />}
        </div>
      )}

      <div className="relative px-3 py-2">
        <CodeView lines={visibleLines} language={language} showLineNumbers={showLineNumbers} />
        {collapsed && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
            style={{
              background: "linear-gradient(to top, var(--sina-color-surface-sunken), transparent)",
            }}
          />
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-t border-border-subtle px-3 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            iconRight={<CaretDown className="size-control-2xs" />}
            onClick={() => setOpen(true)}
          >
            <span className="font-mono text-xs">See all · {lines.length} lines</span>
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-sm">{title ?? "See all"}</DialogTitle>
            <div className="flex items-center gap-1.5">
              {showCopy && <CopyButton code={code} />}
              <DialogClose asChild>
                <Button variant="ghost" size="sm" aria-label="Close">
                  <X className="size-control-2xs" />
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2">
            <CodeView lines={lines} language={language} showLineNumbers={showLineNumbers} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
