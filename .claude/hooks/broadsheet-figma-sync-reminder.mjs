#!/usr/bin/env node
/**
 * SINA Broadsheet (marketing) → Figma sync reminder.
 *
 * PostToolUse hook for Edit|Write|MultiEdit. When a marketing (Broadsheet)
 * source file is touched under apps/web/app/(marketing)/broadsheet/, it surfaces
 * a non-blocking reminder to run `/marketing-figma-sync` so the matching
 * component on the SINA-marketing Figma file stays in lockstep. This is the
 * marketing twin of primitive-figma-sync-reminder.mjs.
 *
 * WHAT COUNTS AS A SYNC TRIGGER (a marketing component's visible surface can
 * change from more than its .tsx — this is why the Badge resize once drifted):
 *   - <Name>.tsx           — component markup / props / anatomy
 *   - <Name>.module.css    — a component's own styling (size, color, spacing)
 *   - broadsheet.css       — the --sinamk-* FOUNDATION; a token edit here can
 *                            move EVERY marketing component in Figma at once
 *   - registry.tsx         — the controls schema = the prop/variant surface
 *                            (adding a control means a new Figma variant axis)
 * Skipped: test files, and pure scaffolding .ts (cn.ts / types.ts / index.ts),
 * which carry no visible surface.
 *
 * Non-blocking by design: it ALWAYS exits 0 and only emits `additionalContext`
 * (advice the model sees, never a gate). The reverse direction (Figma → code)
 * can't be hooked — Figma edits raise no local file event — so this covers the
 * code → Figma half only; invoke the skill manually after a Figma change.
 *
 * Read-only: it never writes files and early-exits on anything that isn't a
 * Broadsheet source file, so editing this script / settings / docs can't loop.
 */

import { readFileSync } from "node:fs";
import { relative, resolve, basename } from "node:path";

const BROADSHEET_DIR = "apps/web/app/(marketing)/broadsheet/";

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

/**
 * Classify a Broadsheet-relative file into a sync trigger, or null to skip.
 * Returns { kind, name } where name is the component/foundation label.
 */
function classify(file) {
  if (file.endsWith(".test.tsx") || file.endsWith(".test.ts")) return null;

  // The --sinamk-* foundation: one edit can move every component in Figma.
  if (file === "broadsheet.css") return { kind: "foundation", name: "broadsheet.css" };

  // The controls manifest: defines the prop/variant surface mirrored to Figma.
  if (file === "registry.tsx") return { kind: "registry", name: "registry" };

  // A component's own styling.
  if (file.endsWith(".module.css")) return { kind: "css", name: basename(file, ".module.css") };

  // A component's markup/props. (cn.ts / types.ts / index.ts are .ts, not .tsx.)
  if (file.endsWith(".tsx")) return { kind: "tsx", name: basename(file, ".tsx") };

  return null;
}

function message(kind, name, rel) {
  const tail =
    `mirror it into the SINA-marketing Figma file (oanAjqh5ei2L5BDURxnEi4, page 12:8) by running the ` +
    `/marketing-figma-sync skill (code → Figma direction). Skip if the edit was an internal refactor with ` +
    `no visual/prop change.`;
  switch (kind) {
    case "foundation":
      return (
        `The Broadsheet FOUNDATION was just edited (${rel}). A --sinamk-* token change can shift the ` +
        `appearance of every marketing component (color, size, spacing, radius, elevation). Re-check each ` +
        `affected component and ${tail}`
      );
    case "registry":
      return (
        `The Broadsheet controls manifest was just edited (${rel}). If a component's control axes changed ` +
        `(a size/variant/state axis, a boolean/text prop added or removed), its Figma variant surface must ` +
        `follow — ${tail}`
      );
    case "css":
      return (
        `The marketing (Broadsheet) component "${name}" styling was just edited (${rel}). If this changed a ` +
        `visible value (size, color, spacing, radius, a token it consumes), ${tail}`
      );
    default:
      return (
        `The marketing (Broadsheet) component "${name}" was just edited (${rel}). If this changed its visible ` +
        `prop surface (a size/variant/state axis, a prop, a token, anatomy, or an interaction state), ${tail}`
      );
  }
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

  if (!rel.startsWith(BROADSHEET_DIR)) process.exit(0);

  const file = basename(abs);
  const trigger = classify(file);
  if (!trigger) process.exit(0);

  emit(message(trigger.kind, trigger.name, rel));
}

main();
