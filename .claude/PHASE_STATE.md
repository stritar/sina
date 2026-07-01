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
| 4 — Playground Test Bed (AI SDK) | in-progress | — | code GREEN (typecheck/lint/`next build` 28 routes/9 tests/SSR); design review + Figma component-ization pending — see handoff below |
| 5 — Governed Fintech Components | not-started | — | — |
| 7 — Marketing Site & Docs | not-started | — | — |
| 8 — Release Hardening | not-started | — | — |

**Status values:** `not-started` · `in-progress` · `blocked` · `done`.

---

## Phase 4 handoff (2026-07-01) — pick up here

Full plan: `/Users/denisstritar/.claude/plans/analyze-phase-4-and-delegated-truffle.md`. Phase 4 was expanded into **"the SINA Emulator"** — a split-screen governed-agent sandbox (chat left / interception console right), light **and** dark, designed by the agent from SINA tokens + modern devtools trends, with a screenshot-referenced CodeBlock.

**DONE & verified GREEN (do not redo):**
- **Code** — the emulator lives at `apps/playground/app/page.tsx` (route `/`), all parts under `app/(emulator)/`:
  - `_components/`: `CodeBlock` (+ `highlight.ts` JSON tokenizer — line-numbers, Copy, SINA-token syntax theme, "See all" modal), `ConsoleTimeline`/`ConsoleStage`/`DecisionSummary`/`AuditLedger`/`ServerBoundary`, `ChatThread`/`GovernedWireSummary`/`BlockedState`/`TransportState`/`SecureWireDialogPlaceholder`/`ComparisonToggle`/`Composer`/`ScenarioPicker`/`ModeToggle`/`EmulatorShell`, plus `a11y.test.tsx`.
  - `_lib/`: `gate.ts` (`runGate` — server-side `evaluateWireTransfer`, tees the real `AuditEvent` via `setAuditSink`, measures latency, splits schema/policy violations), `run-emulator.ts` (`gateIntent` mock/direct + `gateLive` via `@ai-sdk/anthropic` **`generateText` tool-calling**, not `streamUI`, for robustness — interception seam identical, §1b honored), `scenarios.ts` (10 fixtures), `types.ts`, `format.ts`, `gate.test.ts`.
  - Wiring done in `package.json` (+`@ai-sdk/anthropic@1.2.12`, +`governance`), `next.config.mjs` (transpile governance), `vitest.config.ts` (node + `jsx:automatic`); Phase-0 spike route deleted.
  - **Verified:** workspace typecheck + lint, `next build` (28 routes, `/` dynamic), `pnpm --filter playground test` = 9/9 (5 gate + 4 jest-axe a11y, zero violations), prod SSR boot. **Run tests `CI=true` + sandbox-off** (vitest `/tmp` EPERM + pnpm no-TTY-purge memories).
- **Figma** (file `kRTCdsBg4WpiGxQQGfvoLU`, new **"Emulator"** page `65:2`): **CodeBlock component** `66:2` (matches the reference screenshot); **hero composition Light `65:3` + Dark `70:16`** (the $60k blocked flow), all colors bound to the Color collection (Light `6:0` / Dark `6:1`) so dark mode flips via mode switch. Both screenshot-verified.

**REMAINING (next steps):**
1. **User design review** of the Light/Dark heroes is pending — apply notes into **both** code and Figma (`/primitive-figma-sync`).
2. **Figma full component-ization** (user explicitly chose this): componentize `ConsoleStage` (Status=pass|fail|flag|info), `ChatTurn` (Role=user|assistant; Kind=governed|blocked|transport), `DecisionSummary` (Result=governed|blocked), `Composer`, `ModeToggle`, `ServerBoundary` as variant sets + Coverage frames (`/figma-component-coverage`); author 5 glyphs (Copy, PaperPlaneTilt, ArrowsClockwise, Sun, Moon) matching the Layout-page glyph set. Follow [[sina-figma-file]] RAW conventions + [[sina-figma-use-gotchas]]. **Mode-pin nuance learned:** for instances to follow a containing frame's light/dark mode, the component/instance must NOT pin a Color mode — `clearExplicitVariableModeForCollection` so they inherit.
3. **Optional code polish** noted during build: composer textarea placeholder clips at narrow width; block-the-stream motion is a basic skeleton→snap.

Do **not** mark Phase 4 `done` until the review is resolved and (per the user) the Figma component-ization is complete; then re-run the §5 / plan verification before flipping.
