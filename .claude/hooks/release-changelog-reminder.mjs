#!/usr/bin/env node
/**
 * SINA changeset → docs changelog reminder.
 *
 * PostToolUse hook for Edit|Write|MultiEdit. When a Changeset is authored (a
 * `.changeset/*.md` file that is not the README), it surfaces a non-blocking
 * reminder that this queues a version bump, and that when the bump lands the
 * hand-maintained docs changelog page must be brought current via
 * `/release-changelog`. The `docs-changelog` guard is the hard gate; this is the
 * nudge that comes first.
 *
 * Non-blocking by design: it ALWAYS exits 0 and only emits `additionalContext`
 * (advice the model sees, never a gate). Read-only: it never writes files and
 * early-exits on anything that isn't a changeset, so editing this script,
 * settings, the changelog page itself, or any other file can't loop.
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

  // Only Changeset entries: .changeset/<name>.md, not the README (or config).
  if (!rel.startsWith(".changeset/")) process.exit(0);
  if (!abs.endsWith(".md")) process.exit(0);
  if (basename(abs).toLowerCase() === "readme.md") process.exit(0);

  emit(
    `A Changeset "${rel}" was just authored — this queues a version bump for the ` +
      `five public packages. When that version publishes, the docs changelog page ` +
      `(apps/web/content/docs/reference/changelog.mdx) must be brought current: the ` +
      `"Current versions" line, the pnpm install snippet, and a new ## X.Y.Z section, ` +
      `then re-translate the five locales. Run the /release-changelog skill. The ` +
      `docs-changelog guard test fails while the page lags the published packages.`,
  );
}

main();
