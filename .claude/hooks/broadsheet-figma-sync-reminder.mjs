#!/usr/bin/env node
/**
 * SINA Broadsheet (marketing) → Figma sync reminder.
 *
 * PostToolUse hook for Edit|Write|MultiEdit. When a marketing component file is
 * touched (apps/web/app/(marketing)/broadsheet/<Name>.tsx — not tests, not the
 * registry/types/index scaffolding), it surfaces a non-blocking reminder to run
 * `/marketing-figma-sync` so the matching component on the SINA-marketing Figma
 * file stays in lockstep. This is the marketing twin of
 * primitive-figma-sync-reminder.mjs.
 *
 * Non-blocking by design: it ALWAYS exits 0 and only emits `additionalContext`
 * (advice the model sees, never a gate). The reverse direction (Figma → code)
 * can't be hooked — Figma edits raise no local file event — so this covers the
 * code → Figma half only; invoke the skill manually after a Figma change.
 *
 * Read-only: it never writes files and early-exits on anything that isn't a
 * Broadsheet component, so editing this script / settings / docs can't loop.
 */

import { readFileSync } from "node:fs";
import { relative, resolve, basename } from "node:path";

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

// The only non-component .tsx in the broadsheet dir is the registry manifest
// (types.ts / index.ts / cn.ts are .ts, so they never reach this filter).
const NON_COMPONENTS = new Set(["registry.tsx"]);

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

  // Only Broadsheet COMPONENT files. Skip tests, the registry, and non-tsx
  // (types.ts / index.ts / *.module.css are not components).
  if (!rel.startsWith("apps/web/app/(marketing)/broadsheet/")) process.exit(0);
  if (!abs.endsWith(".tsx") || abs.endsWith(".test.tsx")) process.exit(0);

  const file = basename(abs); // e.g. "SegmentSelector.tsx"
  if (NON_COMPONENTS.has(file)) process.exit(0);

  const name = basename(abs, ".tsx"); // e.g. "SegmentSelector"

  emit(
    `The marketing (Broadsheet) component "${name}" was just edited (${rel}). If this changed its visible ` +
      `prop surface (a size/variant/state axis, a prop, a token, anatomy, or an interaction state), mirror it ` +
      `into the SINA-marketing Figma file (oanAjqh5ei2L5BDURxnEi4, page 12:8) by running the ` +
      `/marketing-figma-sync skill (code → Figma direction). Skip if the edit was an internal refactor with ` +
      `no visual/prop change.`,
  );
}

main();
