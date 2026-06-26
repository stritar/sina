---
name: phase-status
description: Report or update which SINA roadmap phase is done, reading from .claude/PHASE_STATE.md so the repo never has to be re-audited. Use when asked "what phase are we on", "phase status", "mark phase N done", or "are we ready for phase N".
---

`.claude/PHASE_STATE.md` is the **single source of truth** for phase progress. Use it instead of re-auditing the repo.

## Reporting current status

1. **Read `.claude/PHASE_STATE.md`** and report the current phase directly from the table. Do **not** re-analyze the codebase to infer the phase — that's the whole point of this file.
2. Only fall back to a repo audit if the file is missing or visibly stale (e.g. it claims a phase is `done` but its exit criteria clearly aren't met). If you do, say so explicitly and then reconcile the file.

## Marking a phase done

1. **Re-run that phase's verification** from `ROADMAP.md` §5 / the phase's exit criteria. At minimum `pnpm build && pnpm typecheck && pnpm lint` must be green; run the phase-specific checks too (e.g. `pnpm --filter @sina-design-system/core test` for Phase 2 a11y, the playground mock-mode suite for Phase 4+).
2. **Only on green**, update that phase's row in `.claude/PHASE_STATE.md`:
   - `Status` → `done`
   - `Completed` → today's date (YYYY-MM-DD)
   - `Verified by` → the exact command(s) you ran
3. Set the next phase to `in-progress` if work is starting on it.
4. Keep entries terse. **Never** edit `CLAUDE.md` rules or `ROADMAP.md` narrative from this skill — only the phase table.

## Status values

`not-started` · `in-progress` · `blocked` · `done`.
