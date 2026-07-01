# SINA — Phase State

**Single source of truth for phase progress.** Read this to know where we are; do **not** re-audit the repo. Update **only** via the `/phase-status` skill, which re-runs a phase's verification before flipping it to `done`.

See `ROADMAP.md` for the full definition of each phase and its exit criteria.

| Phase | Status | Completed | Verified by |
|---|---|---|---|
| 0 — Foundation Audit & Wiring | done | 2026-06-26 | `pnpm build && pnpm typecheck && pnpm lint` green; theme preset wired in both apps; boundaries enforced via per-package ESLint `no-restricted-imports`; vitest + jest-axe smoke tests pass |
| 0.5 — Agentic Workflow Setup | done | 2026-06-26 | `pnpm build && pnpm typecheck && pnpm lint && pnpm test` all green; `CLAUDE.md` + 5 skills + post-edit hook landed; hook verified to exit 2 on a React-in-theme boundary probe and skip non-source files |
| 1 — Theme & Design Tokens | done | 2026-06-26 | `pnpm build && pnpm typecheck && pnpm lint && pnpm test` all green; tokens land in `packages/theme/theme.css` (`--sina-*` CSS vars) + Tailwind preset (strict override, alpha-aware colors), consumed by both apps; drift + WCAG 2.2 AA contrast tests pass (`pnpm --filter @sina-design-system/theme test`) |
| 2 — Core Primitives | done | 2026-06-30 | `pnpm build && pnpm typecheck && pnpm lint` all green (28 playground primitive routes build clean); `pnpm --filter @sina-design-system/core test` (60 passed / 26 files) + `pnpm --filter @sina-design-system/theme test` (11 passed); micro-grid spacing tokens + off-grid guard `offgrid-utilities.test.ts` in place; Figma hand-off regenerated → file `kRTCdsBg4WpiGxQQGfvoLU` (see [[sina-figma-file]]). NB `pnpm test` aggregate has a pre-existing turbo/vitest concurrency flake ("no tests"), unrelated. |
| 3 — Zod Constitution (governance + fintech) | done | 2026-06-30 | `CI=true pnpm build && pnpm typecheck && pnpm lint` all green (12/12 tasks); `pnpm --filter @sina-design-system/governance test` (9 passed) + `@sina-design-system/fintech test` (29 passed); aggregate `pnpm test` 12/12 (governance 9 / fintech 29 / core 60 / theme 11) — run sandbox-off (vitest `/tmp` mkdir EPERM under sandbox). New `packages/governance` = the shared seam: interception contract `{valid,violations,requiredComponent}` + `intercept` engine (reject/escalate/flag) + redacting audit emit. `packages/fintech` = wire-transfer constitution: cited `thresholds.ts` (FinCEN CTR/Travel Rule/SAR + $50k approval), reusable cited format primitives (ISO 4217 minor-units, IBAN mod-97, BIC, ABA, Luhn), `.strict()` payload + `wirePolicy` + valid/adversarial fixtures; every decision emits an audit event. `/new-schema` skill hardened. NB pnpm needs `CI=true` (no-TTY purge). |
| 4 — Playground Test Bed (AI SDK) | done | 2026-07-01 | `CI=true pnpm build` (7/7) + `pnpm typecheck` (12/12) + `pnpm lint` (12/12) all green; `pnpm --filter playground test` 9/9 (5 gate + 4 jest-axe, zero violations); `next build` 28 routes. Design review resolved + Figma component-ization complete: Emulator page `65:2` rebuilt entirely from real bound instances — heroes Light `65:3` / Dark `96:1301` + governed-pass `97:595` + Coverage `99:795`; 6 emulator component sets (ServerBoundary/DecisionSummary/ConsoleStage/ModeToggle/Composer/ChatTurn) + 5 glyphs; composer full-width + real "governed by SINA" Badge + corrected 3 violations. Code composer-clip + block-the-stream motion synced. See [[sina-figma-file]]. Run tests `CI=true` + sandbox-off. |
| 5 — Governed Fintech Components | not-started | — | — |
| 7 — Marketing Site & Docs | not-started | — | — |
| 8 — Release Hardening | not-started | — | — |

**Status values:** `not-started` · `in-progress` · `blocked` · `done`.

---

## Phase 4 — DONE (2026-07-01)

Full plans: `analyze-phase-4-and-delegated-truffle.md` (build) + `pick-up-phase-4-cheerful-wall.md` (review/fix pass). Phase 4 = **"the SINA Emulator"** — a split-screen governed-agent sandbox (chat left / interception console right), light **and** dark, from SINA tokens + modern devtools trends, with a screenshot-referenced CodeBlock.

**DONE & verified GREEN (do not redo):**
- **Code** — the emulator lives at `apps/playground/app/page.tsx` (route `/`), all parts under `app/(emulator)/`:
  - `_components/`: `CodeBlock` (+ `highlight.ts` JSON tokenizer — line-numbers, Copy, SINA-token syntax theme, "See all" modal), `ConsoleTimeline`/`ConsoleStage`/`DecisionSummary`/`AuditLedger`/`ServerBoundary`, `ChatThread`/`GovernedWireSummary`/`BlockedState`/`TransportState`/`SecureWireDialogPlaceholder`/`ComparisonToggle`/`Composer`/`ScenarioPicker`/`ModeToggle`/`EmulatorShell`, plus `a11y.test.tsx`.
  - `_lib/`: `gate.ts` (`runGate` — server-side `evaluateWireTransfer`, tees the real `AuditEvent` via `setAuditSink`, measures latency, splits schema/policy violations), `run-emulator.ts` (`gateIntent` mock/direct + `gateLive` via `@ai-sdk/anthropic` **`generateText` tool-calling**, not `streamUI`, for robustness — interception seam identical, §1b honored), `scenarios.ts` (10 fixtures), `types.ts`, `format.ts`, `gate.test.ts`.
  - Wiring done in `package.json` (+`@ai-sdk/anthropic@1.2.12`, +`governance`), `next.config.mjs` (transpile governance), `vitest.config.ts` (node + `jsx:automatic`); Phase-0 spike route deleted.
  - **Verified:** workspace typecheck + lint, `next build` (28 routes, `/` dynamic), `pnpm --filter playground test` = 9/9 (5 gate + 4 jest-axe a11y, zero violations), prod SSR boot. **Run tests `CI=true` + sandbox-off** (vitest `/tmp` EPERM + pnpm no-TTY-purge memories).
- **Figma** (file `kRTCdsBg4WpiGxQQGfvoLU`, new **"Emulator"** page `65:2`): **CodeBlock component** `66:2` (matches the reference screenshot); **hero composition Light `65:3` + Dark `70:16`** (the $60k blocked flow), all colors bound to the Color collection (Light `6:0` / Dark `6:1`) so dark mode flips via mode switch. Both screenshot-verified.

**RESOLVED (2026-07-01 review/fix pass):**
1. **Design review** applied to **both** code and Figma. Composer clip fixed (⌘/Ctrl+Enter hint moved to a mono caption; textarea already `w-full`); block-the-stream reply now eases in (`motion-safe:animate-in`).
2. **Figma full component-ization complete:** `ConsoleStage` `81:143`, `ChatTurn` `87:686`, `DecisionSummary` `80:95`, `Composer` `83:82`, `ModeToggle` `82:103`, `ServerBoundary` `79:17` (variant sets) + `Coverage` `99:795`; 5 glyphs (Copy `78:2`, PaperPlaneTilt `78:6`, ArrowsClockwise `78:10`, Sun `78:16`, Moon `78:27`). Heroes rebuilt from real instances: Light `65:3` / Dark `96:1301` / governed-pass `97:595`. Fixed: composer full-width, real "governed by SINA" Badge (ShieldCheck), all hand-drawn alerts/buttons/chips → real instances, emoji → glyphs, console shows full pipeline + corrected **3** violations (SAR flag + CTR flag + approval escalate). **Mode-pin nuance:** dark hero = clone + frame pinned Color mode `6:1` + `clearExplicitVariableModeForCollection` on all descendants so instances inherit. See [[sina-figma-file]].
3. **Follow-ups (not blocking):** governed-hero Intent CodeBlock still shows the generic $60k payload (CodeBlock `66:2` has no text prop; SummaryList is the visual source of truth). Figma file still not published as a Team Library (manual Figma-UI step).
