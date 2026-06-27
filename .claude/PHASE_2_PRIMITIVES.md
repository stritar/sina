# Phase 2 — Core Primitives Inventory (Fintech-First)

**Purpose.** This is the planning inventory for **Phase 2 — Core Primitives**: every headless, domain-agnostic React primitive the fintech **Use Case 1 (Wire Transfer)** experience needs, prioritized so we know the build order before invoking `/new-primitive`. The ROADMAP names only three by example (`Dialog`, `Grid`, `CurrencyField`); standing the wire-transfer flow up end-to-end needs the fuller set below.

This is an **input to Phase 2 execution, not a status change** — `.claude/PHASE_STATE.md` is updated only via `/phase-status`. Each primitive is built later via `/new-primitive`, one at a time, and **gated on its own design sign-off** (the process gate in `CLAUDE.md` still applies).

## Ground rules every primitive inherits

- **The a11y bar (all four, non-negotiable):** focus-trap (where applicable) + correct ARIA + full keyboard operability + an **automated `axe` (jest-axe) pass**. Tests reuse core's `vitest.config.ts` (jsdom) + `vitest.setup.ts` (`toHaveNoViolations` pre-registered).
- **Boundary: strictly domain-agnostic.** No `zod`, no `fintech`/`defense` imports, and **no domain vocabulary** — no `$50,000`, "limit", or "approval" baked into a `core` name or string. Primitives are neutral (`Alert`, `Field`, `CurrencyField`); fintech meaning is applied only when `fintech`/Phase 5 composes them.
- **Styled via `theme` tokens only.** Semantic roles already available: `surface`/`surface-raised`/`surface-secure`, `intent-danger`/`intent-safe`, `danger`/`success`/`warning`/`info` (+ `*Fg`/`*Bg`), `primary`/`secondary`, `border`/`border-subtle`, `text`/`text-muted`/`text-subtle`, `focus-ring`; control sizes (`size-control-xs…xl`), radius, shadows (`shadow-focus`), and motion (`duration-fast/base/slow`, `ease-standard`, reduced-motion aware). No hardcoded hex in `core`.

## Why these primitives

The fintech experience has three on-screen surfaces, all built from domain-agnostic parts:

1. **Standard transfer confirm** (compliant stream) — a plain governed `Dialog`.
2. **Blocked state** (Phase 4 design hand-off) — what the user sees when SINA drops a stream.
3. **`SecureWireDialog`** (Phase 5) — the over-limit flow forcing secondary managerial approval.

Decomposing those into the smallest reusable, domain-agnostic pieces yields the tiers below.

---

## Tier 1 — Required for `SecureWireDialog` + blocked state (MVP fintech)

| Primitive | Radix base | Role | a11y focus | Fintech surface |
|---|---|---|---|---|
| **Dialog** | `@radix-ui/react-dialog` | Focus-trapped modal shell | focus-trap, `role=dialog`, `aria-labelledby`/`aria-describedby`, Esc + overlay close | all three surfaces |
| **Button** | native `<button>` (+ Radix `Slot` for `asChild`) | Action trigger; variants (primary / secondary / danger / ghost), loading + disabled | `aria-disabled`/`aria-busy`, visible focus ring, keyboard activation | Confirm / Cancel / Approve |
| **Field** | `@radix-ui/react-label` (+ wrapper) | A11y form-control wrapper: label + description + error; wires `aria-describedby`/`aria-invalid`/`id` | the seam that makes every input screen-reader-correct | wraps every input below |
| **CurrencyField** | native input wrapped in `Field` | Formatted numeric/currency input — **display formatting only, no limit logic** | `inputmode=decimal`, label association, error messaging | transfer amount |
| **Select** | `@radix-ui/react-select` | Single-select listbox | typeahead, arrow-key nav, `aria-activedescendant` | source / destination account |
| **Alert** / Callout | role-based (no Radix needed) | Inline status banner; `intent-danger`/`intent-safe`/`warning` surfaces | `role=alert`/`status`, not color-only | **blocked state** + violation messages |

## Tier 2 — Completes a realistic wire-transfer form & approval flow

| Primitive | Radix base | Role | Fintech surface |
|---|---|---|---|
| **TextField** | native input in `Field` | Single-line text | recipient name, memo / reference |
| **Checkbox** | `@radix-ui/react-checkbox` | Boolean acknowledgement | "I authorize this transfer" |
| **CredentialField** (PIN/code) | native input in `Field`, `type=password` / OTP | Masked secondary-approval secret (domain-neutral; CAC specifics stay in `defense`) | manager approval code in `SecureWireDialog` |
| **Badge** | role-based span | Status pill (`intent-danger`/`intent-safe`/`warning`) | "Requires approval" / "Blocked" / "Compliant" indicator |
| **Spinner** / Progress | role-based (`role=status`) / `@radix-ui/react-progress` | Pending indicator for **server-side validation in flight** (the interception "validating…" beat) | the stream-pending moment before pass/block resolves |
| **Grid** / Stack | layout (no Radix) | Structured layout + spacing from theme tokens | dialog body layout |
| **SummaryList** (DescriptionList) | semantic `<dl>` (built on Grid) | Key/value review rows | transfer summary (from / to / amount / fee) |

## Utilities — a11y substrate (small, load-bearing, build early)

| Primitive | Radix base | Role | Needed by |
|---|---|---|---|
| **VisuallyHidden** | `@radix-ui/react-visually-hidden` | Screen-reader-only text | Dialog labels, icon-only buttons, Badge context |
| **Icon** / AccessibleIcon | `@radix-ui/react-accessible-icon` wrapping **`lucide-react`** glyphs | Accessibly-labeled glyph (lock / shield / warning) vs decorative `<svg>` | Button, Alert, Badge |

> **Icon library decision — Lucide (`lucide-react`, ISC license).** Chosen over Radix Icons / Heroicons for catalog size (~1500 icons, covers the fintech + future defense governance vocabulary), active maintenance, per-icon tree-shakeable imports (respects `sideEffects: false`), and `currentColor` rendering so theme `text-*` tokens drive icon color — **no hardcoded hex**, consistent with the hex-only token rule. Added as a `core` dependency (domain-agnostic, so no boundary conflict). The library stays an internal detail behind our `Icon`/`AccessibleIcon` wrapper, which enforces accessible labeling and keeps it swappable.

## Tier 3 — Polish / later

| Primitive | Radix base | Role | Notes |
|---|---|---|---|
| **Separator** | `@radix-ui/react-separator` | Section divider | low effort, cosmetic |
| **Toast** | `@radix-ui/react-toast` | Transient notification | pairs with audit-event surfacing (Phase 8 sink) |
| **Tooltip** | `@radix-ui/react-tooltip` | Explain *why* something is blocked / requires approval | governance-status affordance |
| **ScrollArea** | `@radix-ui/react-scroll-area` | Scrollable dialog body without breaking the focus trap | long transfer summary + approval content |
| **Combobox** | `@radix-ui/react-combobox` or Select + filter | Searchable account picker | upgrade over `Select` when account lists grow |
| **RadioGroup** | `@radix-ui/react-radio-group` | Exclusive choice | e.g. transfer speed / type, if design calls for it |

## Tier AI — AI-Native primitives (governed agent surface)

Added during the Phase 2 design exploration (full Figma showcase: page **`Primitives / AI-Native`**). SINA is a design system *for AI agents*, and the current AI-UX conventions — full-width role-attributed messages (not bubbles), streaming with a stop control, inline tool-use disclosure, and human-in-the-loop confirmation — map directly onto the **validate-then-mount** interception beat. These are the "static/controlled generative UI" surface the model emits *intent* into.

| Primitive | Base | Role | a11y focus | SINA surface |
|---|---|---|---|---|
| **Message** | role-based article | Full-width, role-attributed turn (`user`/`assistant`/`system`/`tool`); `streaming`/`complete`/`error`; markdown + code + citations | `role`, live-region announce on streaming, `aria-busy` while streaming | the conversation; the **governed variant** mounts a validated component inline |
| **Composer** / PromptInput | native `<textarea>` in `Field` | Auto-resizing input; attachments, token counter, **send vs stop** while streaming, suggestion chips | label, keyboard-operable suggestions, focus ring, stop is a real button | the chat's primary action |
| **ToolCallCard** | `@radix-ui/react-collapsible` | Tool-use disclosure — name + status (`pending`/`running`/`success`/`error`) + collapsible args/result | `role=status` on the status, expandable region wired with `aria-controls` | where the interception result (`requiredComponent`) surfaces inline |
| **StreamingIndicator** | role-based (`role=status`) | Typing dots / shimmer + the SINA-specific **"validating…"** beat while the constitution gate runs server-side | `role=status`, `aria-live=polite`, reduced-motion aware | the pending moment before pass/block resolves |
| **InlineConfirm** | role-based (built on `Alert`+`Button`) | Human-in-the-loop approval inline in the conversation; `pending`/`approved`/`rejected` | focus moves to the prompt, Approve/Reject keyboard-operable | the high-stakes pause (e.g. over-limit send) |
| **Citation** / Source | role-based | Numbered inline marker → expanded source card (title / url / snippet) | marker is a `button` with `aria-describedby` the source | grounds an answer; lets the user audit it |

> **Boundary — these stay inside `core`.** Every AI-native primitive is **domain-agnostic**: no `zod`, no `fintech`/`defense` import, and no domain vocabulary baked in. `Message`, `Composer`, `ToolCallCard`, `StreamingIndicator`, `InlineConfirm`, `Citation` are neutral chat/agent parts; fintech meaning (limits, approval codes, "$50,000") is applied only when `fintech`/Phase 5 composes them — exactly as for `Dialog`/`Field`/`Alert`. They still owe the full a11y bar + an axe test like every other `core` primitive.

---

## Design-decision notes (not new primitives)

1. **Dialog anatomy.** `Dialog` ships as a *set*, not one export: Trigger / Overlay / Content / **Title** / **Description** / Close. The `aria-labelledby`/`aria-describedby` wiring **depends on** Title + Description existing — so the first build must include them, or it ships a half-accessible Dialog.
2. **`Field` is presentational only — no validation.** Radix offers `@radix-ui/react-form` with built-in *client-side* validation. Per `CLAUDE.md` / ROADMAP §1b, client checks are **untrusted UX sugar**; the authoritative gate is server-side (`fintech` schemas, Phase 3/4). `Field` wires labels / `aria-invalid` / `aria-describedby` and *displays* an error passed to it, but contains **no validation logic** — so we never grow a second validation path inside `core`.
3. **The blocked state is a composition, not a primitive.** The Phase-4 blocked state is `Alert` + `Badge` + `Button` + layout, not a new `core` export — *unless* design wants a dedicated `BlockedPanel` shell. **Open question for the Phase 4 design hand-off**, not pre-built here.

## Build order

1. **`Dialog` → `Button` → `Field`** first — they unblock everything else.
2. **`CurrencyField`, `Select`, `Alert`** next — completes Tier 1; enough to render both the compliant confirm and the blocked state in the playground (Phase 2 exit criteria: rendered in isolation, axe-green).
3. **Tier 2** as the `SecureWireDialog` anatomy (Phase 5 hand-off) firms up.
4. **Tier 3** opportunistically.

> Build **VisuallyHidden** and **Icon** (Utilities) alongside Tier 1 — `Dialog` and the icon-bearing `Button`/`Alert`/`Badge` depend on them to pass axe, so they are **not** "later."

Keep a per-primitive checklist against the a11y bar. Note that `Field`, `Alert`, and `Badge` are **role-based (not Radix)**, so they still need explicit ARIA + an axe test like the rest — being non-Radix does not exempt them from the bar.
