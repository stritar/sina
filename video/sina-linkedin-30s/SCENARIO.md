# SINA — 30-second LinkedIn intro

**Scenario, timeline and build brief.**
Canvas **1080 × 1350 (4:5)** · **30 fps** · **900 frames** · After Effects · no plugins.

---

## 1. The brief

The video plays **muted, in a scrolling feed**. It has one job: **earn the read.** The LinkedIn
post copy explains what SINA is — the film only has to make someone stop and want to know.

But it must earn that stop **without raising its voice.**

The reference register is [noxtua.com](https://www.noxtua.com), whose own headline is the whole
instruction:

> **"Less Hollywood. More substance."**

Noxtua sells trust to lawyers and it does it by being *boring on purpose*: verified sources,
GDPR, BSI C5, TISAX, ISO — listed flatly, no adjectives. The confidence comes from **specificity**,
not from volume.

So: **no sirens. No red flashes. No glitch. No "your AI agent is DANGEROUS."** The most
persuasive thing SINA owns is that its refusals cite real federal regulation, run server-side,
finish in under a millisecond, and leave an audit record. That's the film.

### What we inherit from your Remarkable/Embeddable video

`video/linkedin-video.mp4` (40s, white ground). Its grammar works and we reuse it:

| Device | How SINA uses it |
|---|---|
| Typewriter mono type-on + blinking caret (`>Make it feel like ours`) | The agent's prompt: `> Wire $60,000 to Beta LLC.` |
| **A console log as the spine** — one line at a time, small coloured dot per line | SINA's *real* console: `Intent received` → `Schema gate · passed` → `Policy · flagged` → `Decision` → `Audit event · redacted` |
| Each log line intercut with **literal visual proof** (the type specimen, the colour swatch) | Each finding intercut with **its regulatory citation** |
| **One hero asset, reused** (the dashboard grid, recoloured) | **Two screenshots**, one dissolving into the other |
| Quiet type endcard | Same |

The one thing we change: **ground is dark.** A LinkedIn feed is white. A near-black 4:5 block is
a hole punched in the page — it stops the scroll through contrast alone, with no gimmick, and it
reads as serious infrastructure. SINA already ships a real, AA-guarded dark theme, so this costs
nothing.

---

## 2. The story

The flagship scenario, from `packages/governance-demo/src/scenarios.ts`:
**a $60,000 wire against a $50,000 approval limit.**

The arc is **not** threat → rescue. It is:

> **an ordinary-looking screen → the quiet discovery that nothing checked it → the check running,
> in public, with citations → the correct component appearing in its place.**

The payoff is **substitution, not refusal.** SINA doesn't shout NO. It quietly removes the
confirm button an AI hallucinated and puts the *right* component there instead — one that
demands a second approver. That's the reassuring beat, and it's what the product actually does.

---

## 3. Canvas, palette, type

### Colour — real SINA dark tokens (`packages/theme/theme.css`)

| Role | Hex | Used for |
|---|---|---|
| ground | `#21251e` | comp background |
| surface | `#353b31` | the two cards |
| text | `#f5f6f4` | primary type |
| muted | `#cbd0c5` | captions, body copy |
| subtle | `#84897e` | citations, latency, url |
| hairline | `#434841` | rules, card borders |
| **warning fill** | `#fcb737` | the two `FLAG` chips |
| **danger fill** | `#ff7e48` | the one `ESCALATE` chip |
| chip ink | `#000000` | text inside the chips |
| primary button | `#b9c4b1` (ink `#21251e`) | "Request approval" |

> **Colour discipline — the single most important rule in this document.**
> The frame is **monochrome olive-black for the first 9 seconds.** Colour arrives **once**, when
> the policy speaks: two gold chips and one coral chip. Nothing else in the film is coloured.
> **There is no red anywhere in this video.** That restraint *is* the aesthetic — it's what
> separates "credible infrastructure" from "scare ad".

### Type — Rubik + IBM Plex Mono (SINA's real font tokens; both free on Google Fonts)

Install both before opening AE. Layout margin: **96 px** each side → **888 px** content column.

| Element | Font | Size | Colour |
|---|---|---|---|
| Agent prompt | Plex Mono Medium | 48 / 62 | `#f5f6f4` |
| The turn caption | Plex Mono Regular | 40 / 54 | `#cbd0c5` |
| Boundary label | Plex Mono Regular, tracking 40 | 22 | `#84897e` |
| Console stage | Plex Mono Medium | 32 | `#f5f6f4` |
| Console dot | — (10 px circle) | — | per-stage |
| Latency | Plex Mono Regular | 24 | `#84897e` |
| Violation message | Plex Mono Regular | 28 | `#f5f6f4` |
| Citation (under it) | Plex Mono Regular | 22 | `#84897e` |
| Severity chip | Plex Mono Medium, tracking 80, caps | 20 | `#000000` on fill, pill, 8×16 pad |
| Dialog title | Rubik Medium | 44 | `#f5f6f4` |
| Dialog body | Rubik Regular | 26 / 38 | `#cbd0c5` |
| Summary row | Rubik Regular | 26 | label `#84897e` · value `#f5f6f4` |
| Thesis lines | Rubik Regular | 60 / 78 | `#f5f6f4` → `#84897e` |
| Endcard wordmark | Rubik Medium, tracking 160 | 112 | `#f5f6f4` |
| Endcard tagline | Rubik Regular | 30 | `#cbd0c5` |
| Endcard url | Plex Mono Regular | 24 | `#84897e` |

---

## 4. Timeline

30.0 s · 900 frames @ 30 fps.

| # | Time | Frames | Beat | On screen |
|---|---|---|---|---|
| 0 | 0.0–0.5 | 0–15 | Caret blinks in the void. Whole comp holds a slow 1.03 → 1.00 scale across beats 0–3 — a push-in so gentle it reads as *alive*, not as a move | `_` |
| 1 | 0.5–2.3 | 15–69 | **Typewriter.** The agent asks | `> Wire $60,000 to Beta LLC.` |
| 2 | 2.3–3.8 | 69–114 | **The ungoverned card** fades in + rises 12 px. This is what a normal app would have mounted | `ungoverned · no gate ran` / `Wire $60,000.00 to Beta LLC?` / `[ Confirm transfer ]` |
| 3 | 3.8–6.0 | 114–180 | **The turn.** Two mono lines, the second landing ~0.8 s after the first. Flat, factual, unhurried | `Looks correct.` … `Nothing checked it._` |
| 4 | 6.0–6.8 | 180–204 | Card dims to **25 %** and lifts out of focus. A hairline rule draws down the left. The boundary label sets above it — **this four-word line is SINA's entire architectural claim** | `server-side · validated before mount` |
| 5 | 6.8–12.0 | 204–360 | **The console.** Four stage rows, dot + label, ~0.6 s stagger. Dots: `#84897e`, `#84897e`, `#fcb737`, `#ff7e48`. Latency sets beside *Decision* | `Intent received` / `Schema gate · passed` / `Policy · flagged` / `Decision` · `gate < 1 ms` |
| 6 | 9.4–13.8 | 282–414 | **The findings** — three rows under *Policy · flagged*. Message, citation beneath in subtle, severity chip right-aligned. Slide in +8 px, 0.5 s apart. **← the money frame** | see §5 |
| 7 | 13.8–15.0 | 414–450 | Fifth console row + its footnote. For a compliance reader this lands harder than the block itself | `Audit event · redacted` / `iban / accountNumber hashed · card fields dropped` |
| 8 | 15.0–16.2 | 450–486 | The ungoverned card's contents **dissolve**; the card grows 0.96 → 1.00 and returns to full opacity. Same card. Different component | — |
| 9 | 16.2–21.5 | 486–645 | **SecureWireDialog** resolves in its place — the component the constitution *forced* | `Secondary approval required` / `This wire exceeds the approval threshold…` / `Amount $60,000.00` · `To Beta LLC` · `Rail SEPA` / `[ Close ] [ Request approval ]` |
| 10 | 21.5–22.3 | 645–669 | Clear. Everything fades and scales to 0.98 | — |
| 11 | 22.3–26.2 | 669–786 | **The thesis.** Three lines, 0.6 s apart. As each new line lands, the ones above drop to `#84897e` — so the last line is the only lit thing on screen | `The model proposes.` / `The server decides.` / `Only what passed renders.` |
| 12 | 26.2–29.6 | 786–888 | **Endcard.** Wordmark, hairline draws, tagline, url | `SINA` / `The governed design system for AI agents.` / `free & open source · sinahub.app` |
| 13 | 29.6–30.0 | 888–900 | **Loop stinger.** Hard cut back to the blinking caret. **Frame 899 ≡ frame 0**, so LinkedIn's autoloop reads as deliberate rather than as a video that fell off a cliff | `_` |

### Beat 6 — the money frame

```
  ·  Policy · flagged

     Suspicious-activity review (SAR)              [ FLAG ]
     FinCEN — 31 CFR Ch. X

     Reportable transaction (CTR)                  [ FLAG ]
     FinCEN — 31 CFR 1010.311

     Over the $50,000 approval limit           [ ESCALATE ]
     SINA dual-control policy
```

Two gold chips and one coral chip on a near-black field, the dead ungoverned card greyed out
above them. **Export frame 414 as a PNG and set it as the LinkedIn custom thumbnail** — otherwise
LinkedIn grabs frame 1, which is an almost-empty screen.

---

## 5. Copy sheet

Every string on screen, and the file it came from. **Nothing here is invented.** If a string is
compressed for legibility at 4:5, both forms are shown.

| On screen | Source | Note |
|---|---|---|
| `> Wire $60,000 to Beta LLC.` | `governance-demo/src/scenarios.ts` | Source prompt: *"Wire $60,000 from Acme Corp to Beta LLC right away."* Trimmed to fit at 48 px. |
| `ungoverned · no gate ran` | `governance-demo/src/ComparisonToggle.tsx` | verbatim |
| `Wire $60,000.00 to Beta LLC?` | `ComparisonToggle.tsx` | verbatim |
| `Confirm transfer` | `ComparisonToggle.tsx` | verbatim — the button an ungoverned app mounts |
| `Looks correct.` / `Nothing checked it.` | `content/docs/index.mdx` | Compressed from *"The output looks correct, which is why it ships."* |
| `server-side · validated before mount` | `governance-demo/src/ServerBoundary.tsx` | verbatim |
| `Intent received` | `governance-demo/src/ConsoleTimeline.tsx` | verbatim |
| `Schema gate · passed` | `ConsoleTimeline.tsx` | verbatim |
| `Policy · flagged` | `ConsoleTimeline.tsx` | verbatim |
| `Decision` | `ConsoleTimeline.tsx` | verbatim |
| `gate < 1 ms` | **measured** | See §9. Real: p50 **0.006 ms**, p99 **0.024 ms**. `< 1 ms` is deliberately conservative. |
| `Audit event · redacted` | `ConsoleTimeline.tsx` | verbatim |
| `iban / accountNumber hashed · card fields dropped` | `ConsoleTimeline.tsx` | Source: *"redaction: card fields dropped · iban / accountNumber hashed"* — reordered, same facts |
| `Suspicious-activity review (SAR)` · `FinCEN — 31 CFR Ch. X` · FLAG | `content/docs/governance/wire-transfer.mdx` policy table | verbatim from the published table |
| `Reportable transaction (CTR)` · `FinCEN — 31 CFR 1010.311` · FLAG | same table | verbatim |
| `Over the $50,000 approval limit` · `SINA dual-control policy` · ESCALATE | same table | verbatim |
| `Secondary approval required` | `fintech-react/src/SecureWireDialog/SecureWireDialog.tsx` | verbatim dialog title |
| `This wire exceeds the approval threshold and requires secondary approval before it can proceed.` | `SecureWireDialog.tsx` | verbatim. Trim to *"This wire exceeds the approval threshold. A second party must approve it."* if it crowds the card |
| `Close` / `Request approval` | `SecureWireDialog.tsx` | verbatim |
| `The model proposes.` / `The server decides.` / `Only what passed renders.` | `content/docs/index.mdx` | Split from *"The model proposes; the server decides; the screen shows only what passed."* |
| `The governed design system for AI agents.` | `apps/web/app/(marketing)/page.tsx` | verbatim tagline |

**Row order note:** the findings appear in the order the gate actually emits them (SAR, then CTR,
then the escalation) — not in the docs table's order. Verified by running `evaluateWireTransfer`
against the `overLimitTransfer` fixture.

---

## 6. Assets — two PNGs. That's the whole list.

Do **not** rebuild these in After Effects. They already exist, in dark mode, accessible, with the
right tokens. Screenshot them.

1. **`ungoverned-card.png`** — the "Ungoverned" side of `ComparisonToggle`.
2. **`secure-wire-dialog.png`** — `SecureWireDialog`, `review` phase.

**Capture:**
```bash
pnpm dev                      # from the repo root — rebuilds libs + runs the apps
# playground on :3001, docs on :3000
```
Switch to the dark theme, open the `over-limit` scenario, and screenshot at **2× DPR** on a
transparent or `#21251e` background. Trim to the card bounds.

Everything else in the film is a **text layer, a 1 px rectangle, or a 10 px circle.**

---

## 7. The six After Effects techniques this needs

Nothing outside this list. No plugins, no 3D, no expressions beyond one line.

1. **Typewriter** — `Effects & Presets → Animation Presets → Text → Animate In → Typewriter`.
   Drop it on the text layer, then drag its two keyframes to span the beat.
2. **Blinking caret** — a small solid rectangle. Alt-click the Opacity stopwatch and paste:
   ```js
   Math.floor(time / 0.5) % 2 === 0 ? 100 : 0
   ```
3. **Fade + rise** — the only "animation" in the film. Opacity `0 → 100` and Position `y+12 → y`
   over 10–12 frames. Select both keyframes → **F9** (Easy Ease) → in the Graph Editor drag the
   outgoing handle to ~70 % influence. Do it once, then copy-paste those keyframes everywhere.
4. **Stagger** — don't write an expression. Duplicate the row layer (`⌘D`) and drag each copy
   **15 frames** right in the timeline. That's it.
5. **Cross-dissolve** (beat 8) — stack the two card PNGs, keyframe the top one's Opacity
   `100 → 0` while the bottom goes `0 → 100`, and put a Scale `96 → 100` on the parent null.
6. **Hairline draw** — a thin rectangle with a **Linear Wipe** effect; keyframe `Transition
   Completion` `100 → 0`. Use it for the left rule and the endcard rule.

Parent every element to **one null** and put the 1.03 → 1.00 push-in on that null alone.

---

## 8. Delivery

- **Export:** H.264, MP4, 1080 × 1350, 30 fps, ~10–12 Mbps. (AE: Media Encoder → *Match Source –
  High bitrate*, then set the resolution.)
- **Thumbnail:** export **frame 414** as PNG and upload it as the custom thumbnail. Do not let
  LinkedIn pick — frame 1 is nearly empty.
- **Loop:** confirm frame 899 matches frame 0 before you export.
- **Captions:** none needed — there is no voice-over and no spoken word. Say so if asked.
  Every on-screen pairing (black ink on `#fcb737` / `#ff7e48`, `#f5f6f4` on `#21251e`) already
  clears WCAG AA, because those are SINA's own contrast-guarded tokens. Given that SINA *sells*
  accessibility, someone will check. It holds.
- **Sound (optional, for the ~15 % who unmute):** soft typewriter ticks under beat 1, one low
  settle tone at frame 414 when the ESCALATE chip lands, silence elsewhere. Never required — the
  film is designed mute-first.

### The 20-second cut, if completion rate matters more than depth

Drop beat 7 (audit), cut the thesis to its last line only, and tighten the console stagger from
0.6 s to 0.4 s. Keep beats 0–6 and 9 intact — the prompt, the turn, the citations and the
substitution are the film. Everything else is garnish.

---

## 9. Honesty ledger

The point of this film is that SINA's claims are checkable. So the film's own claims are too.

- **`gate < 1 ms`.** Measured, not estimated. `evaluateWireTransfer()` against the
  `overLimitTransfer` fixture, 20 000 iterations after a 2 000-iteration warm-up:
  **p50 0.006 ms · p90 0.008 ms · p99 0.024 ms** (in-process, this machine).
  The on-screen `< 1 ms` refers to **the gate evaluation**, not a network round-trip — over the
  edge endpoint you'd add RTT. It is stated conservatively on purpose. An earlier draft of this
  script said "4 ms"; that was invented, and measuring killed it.
- **The three findings and the forced component are real output**, not a mock-up: the gate returns
  `valid: false`, `requiredComponent: "SecureWireDialog"`, and exactly those three violations.
- **The citations are real:** 31 CFR 1010.311 (CTR) and 31 CFR Chapter X (SAR) are the FinCEN
  rules SINA's `thresholds.ts` encodes. The $50,000 limit is SINA's own dual-control policy and is
  labelled as such on screen — not dressed up as regulation.

If any of this changes in the code, the video is wrong and should be recut. That is the intended
relationship between the two.

---

## 10. The post that sits above it

The film stops the scroll; this does the explaining. Same register — flat, specific, no adjectives.

> Ask an AI to render a transfer confirmation and it will render one.
>
> Including for $60,000 that nobody approved. The output looks correct, which is why it ships.
>
> I built SINA to sit in the render path instead. The model emits an **intent** — never a
> component. Your server validates that intent against rules you wrote as code. Only what passes
> is allowed to mount.
>
> In the clip: a $60,000 wire hits a $50,000 approval limit. The gate flags it under 31 CFR
> 1010.311 and 31 CFR Chapter X, escalates it under dual-control, writes a redacted audit record,
> and replaces the confirm button the model hallucinated with a dialog that demands a second
> approver. Server-side, before a single pixel mounts.
>
> Validate, then mount. Never mount, then check.
>
> It's free and open source, and it's built for the startups and solo builders who want to adopt
> agentic UI without first building a governance layer.
>
> → sinahub.app

**Notes on the post:**
- Line 1–2 are the hook and must survive LinkedIn's "…see more" fold — keep them at the top.
- Naming the actual CFR sections is the whole credibility play. Don't cut them for brevity.
- No hashtag spam. Two at most, at the very bottom, or none.
- First comment is the place for the repo link if you'd rather keep the post body clean —
  LinkedIn suppresses posts with outbound links in the body.
