#!/usr/bin/env node
/**
 * SINA docs → translations sync reminder.
 *
 * PostToolUse hook for Edit|Write|MultiEdit. When an ENGLISH docs source page is
 * touched (apps/web/content/docs/**.mdx that is NOT a `<page>.<locale>.mdx`
 * translation sibling), it surfaces a non-blocking reminder to run
 * `/translate-docs` so the five locale siblings (es/zh/fr/de/ja) stay in sync.
 * The `docs-i18n` guard is the hard gate; this is the nudge that comes first.
 *
 * Non-blocking by design: it ALWAYS exits 0 and only emits `additionalContext`
 * (advice the model sees, never a gate). Read-only: it never writes files and
 * early-exits on anything that isn't an English docs page, so editing a
 * translation, a meta file, this script, or settings can't loop.
 */

import { readFileSync } from "node:fs";
import { resolve, relative, basename } from "node:path";

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

const LOCALE_SIBLING = /\.(es|zh|fr|de|ja)\.mdx$/;

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
  const rel = relative(projectDir, abs).replace(/\\/g, "/");

  // Only ENGLISH docs source pages: apps/web/content/docs/**.mdx, not a
  // translation sibling.
  if (!rel.startsWith("apps/web/content/docs/")) process.exit(0);
  if (!abs.endsWith(".mdx")) process.exit(0);
  if (LOCALE_SIBLING.test(basename(abs))) process.exit(0);

  emit(
    `The English docs page "${rel}" was just edited. Its five translations ` +
      `(es/zh/fr/de/ja) are now stale or missing — run the /translate-docs skill to ` +
      `regenerate the <page>.<locale>.mdx siblings and refresh their sourceHash. The ` +
      `docs-i18n guard test will fail until they are in sync.`,
  );
}

main();
