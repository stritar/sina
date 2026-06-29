#!/usr/bin/env node
/**
 * SINA primitive→Figma sync reminder.
 *
 * PostToolUse hook for Edit|Write|MultiEdit. When a core primitive *component*
 * file is touched (packages/core/src/<Name>/<Name>.tsx — not tests, not utils,
 * not index), it surfaces a non-blocking reminder to run `/primitive-figma-sync`
 * so the matching component on the SINA Figma file stays in lockstep.
 *
 * Non-blocking by design: it ALWAYS exits 0 and only emits `additionalContext`
 * (advice the model sees, never a gate). The reverse direction (Figma → code)
 * can't be hooked — Figma edits raise no local file event — so this covers the
 * code → Figma half only; invoke the skill manually after a Figma change.
 *
 * Read-only: it never writes files and early-exits on anything that isn't a
 * primitive component, so editing this script / settings / docs can't loop.
 */

import { readFileSync } from "node:fs";
import { relative, resolve, basename, dirname } from "node:path";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function emit(context) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: context,
      },
    }),
  );
  process.exit(0);
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

  // Only primitive COMPONENT files: packages/core/src/<Name>/<Name>.tsx.
  // Skip tests, the barrel, utils, and non-tsx.
  if (!rel.startsWith("packages/core/src/")) process.exit(0);
  if (!abs.endsWith(".tsx") || abs.endsWith(".test.tsx")) process.exit(0);

  const name = basename(abs, ".tsx"); // e.g. "Toast"
  const dir = basename(dirname(abs)); // e.g. "Toast"
  // Component file === <Name>/<Name>.tsx (the dir matches the file stem).
  if (name !== dir) process.exit(0);

  emit(
    `The core primitive "${name}" was just edited (${rel}). If this changed its visible prop surface ` +
      `(a cva variant/size, a prop, a token, anatomy, or an interaction state), mirror it into the SINA ` +
      `Figma file by running the /primitive-figma-sync skill (code → Figma direction). Skip if the edit was ` +
      `an internal refactor with no visual/prop change.`,
  );
}

main();
