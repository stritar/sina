#!/usr/bin/env node
/**
 * SINA post-edit boundary check (Phase 0.5).
 *
 * PostToolUse hook for Edit|Write. Reads the tool payload from stdin, finds the
 * owning workspace package for the edited file, and lints just that file with
 * the repo's hoisted eslint binary (cwd = package dir, so ESLint flat-config
 * resolves the package's own eslint.config.mjs and its boundary rules).
 *
 * Policy (confirmed in the Phase 0.5 plan):
 *   - An ESLint `no-restricted-imports` violation is an ARCHITECTURAL BOUNDARY
 *     breach -> exit 2 (blocks, feeds the message back as actionable feedback).
 *   - Any other lint finding is ADVISORY -> exit 0 with stderr note.
 *   - A lexical domain-vocabulary hit inside `packages/core` is ADVISORY -> exit 0.
 *
 * We invoke eslint directly (NOT via `pnpm`) on purpose: pnpm in a no-TTY hook
 * can stall reconciling a purged store, and per-file eslint also sidesteps the
 * turbo `^build` dependency. Typecheck is whole-program and slow, so it is left
 * to the explicit `pnpm typecheck` run, not this per-edit hook.
 *
 * The hook is read-only (it never writes files) and early-exits on non-source
 * files, so editing CLAUDE.md / settings.json / PHASE_STATE.md / this script
 * does not trigger it and it can never loop.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const SOURCE_EXT = /\.(ts|tsx|js|mjs|cjs)$/;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function findPackage(filePath) {
  // Walk up from the file's directory to the nearest package.json.
  let dir = dirname(filePath);
  const root = resolve("/");
  while (dir && dir !== root) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
        if (pkg.name) return { name: pkg.name, dir };
      } catch {
        // Unparseable package.json — keep walking up.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function main() {
  const raw = readStdin();
  if (!raw) process.exit(0);

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const projectDir = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const filePath = input.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const abs = resolve(filePath);
  const rel = relative(projectDir, abs);

  // Only check source files inside packages/* or apps/*.
  const inWorkspace = rel.startsWith("packages/") || rel.startsWith("apps/");
  if (!inWorkspace || rel.startsWith("..") || !SOURCE_EXT.test(abs)) process.exit(0);

  const pkg = findPackage(abs);
  if (!pkg) process.exit(0);

  const relToPkg = relative(pkg.dir, abs);
  const env = {
    ...process.env,
    CI: "1",
    NEXT_TELEMETRY_DISABLED: "1",
    TURBO_TELEMETRY_DISABLED: "1",
  };

  // Resolve the hoisted eslint binary. If deps aren't installed, don't block.
  const eslintBin = join(projectDir, "node_modules", ".bin", "eslint");
  if (!existsSync(eslintBin)) process.exit(0);

  // --- Primary: lint just the touched file (fast, sidesteps turbo ^build). ---
  let lintOut = "";
  let lintFailed = false;
  try {
    lintOut = execFileSync(eslintBin, [relToPkg], {
      cwd: pkg.dir,
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    lintFailed = true;
    lintOut = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }

  // Architectural boundary breach -> block.
  if (/no-restricted-imports/.test(lintOut)) {
    process.stderr.write(
      `[SINA boundary] ${rel} violates a package boundary (no-restricted-imports). ` +
        `Fix before continuing:\n${lintOut.trim()}\n`,
    );
    process.exit(2);
  }

  // --- Advisory: lexical domain-vocabulary guard, core only. ---
  if (rel.startsWith("packages/core/")) {
    try {
      const src = readFileSync(abs, "utf8");
      const hits = [];
      if (/\b(NSN|CAC)\b/.test(src)) hits.push("NSN/CAC");
      if (/\$\s?\d{2,}/.test(src)) hits.push("dollar amount");
      if (/\b(transferLimit|requiresApproval)\b/.test(src)) hits.push("limit/approval term");
      if (hits.length) {
        process.stderr.write(
          `[SINA advisory] possible domain vocabulary in core (${hits.join(", ")}). ` +
            `core must stay domain-agnostic — confirm this isn't business logic. (to be hardened)\n`,
        );
      }
    } catch {
      // ignore read errors
    }
  }

  // Any other lint finding is advisory only.
  if (lintFailed && lintOut.trim()) {
    process.stderr.write(`[SINA advisory] eslint findings in ${rel}:\n${lintOut.trim()}\n`);
  }

  process.exit(0);
}

main();
