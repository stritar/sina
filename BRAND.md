# SINA — Brand Lines

The copy system. One place to take lines from, so the site, the READMEs, the posts and the talks all
say the same thing. Companion to `CLAUDE.md` (the rules) and `ROADMAP.md` (the why).

If you are writing anything public-facing for SINA, take a line from here. Don't write a new one.

---

## The slogan

> # The design system that can say no.

Every other design system on earth sells what it will render. This is the first that sells what it
won't.

The word **"can"** is load-bearing — it frames refusal as a *capability*, a thing the others lack.
"Says no" would sound like friction. "Can say no" sounds like power. Don't drop the "can."

## The system

Four lines, four jobs. They are not interchangeable.

| Job | Line |
|---|---|
| **Slogan** — the hook, the thing people repeat | **The design system that can say no.** |
| **Mechanism** — sits directly beneath the slogan; restores precision | The model proposes; SINA decides what renders. |
| **Methodology** — the term of art (see below) | **Validate, then mount.** |
| **Category** — search, npm, GitHub. Don't touch it. | The governed design system for AI agents. |

The hero lockup:

> **SINA**
>
> ## The design system that can say no.
>
> The model proposes; SINA decides what renders. Validate, then mount.
>
> `[ Read the docs → ]`

## `Validate, then mount.` is worth more than the slogan

This one isn't decoration — it's a **methodology name**, the shape of *test-driven development* or
*mobile-first*. Nobody in design systems has ever successfully coined one. The slot is empty and the
term is ours.

Say it as a term of art: always the imperative, always the comma, and paired with its negation where
there's room — **"Validate, then mount. Never mount, then check."** It belongs in the hero, the
README, the glossary, every talk, every post.

A slogan gets admired. A methodology gets *adopted*.

## Campaign lines

The slogan implies an antithesis. Say the other half where there's room.

- **"Every other design system says yes."** — the launch line. Pure category attack.
- **"It says no. Then it says what instead."** — the second beat. The truth about escalation, and it
  turns the slogan's one compression into a feature.
- **"Everyone's racing to let AI generate the interface. SINA decides whether it should."** — the
  long hook. Proven; keep the bar.

## The line bank

Already written, already true, already in voice. Reach for these before inventing.

If the slot you need is empty, the candidates live in **`BRAND_LINES.md`** — 50 lines, grouped by job.
That file is the bench; this one is the team. A line gets promoted here once it's earned it in the wild.

| Line | Job |
|---|---|
| "It's refusing well." | the thesis |
| "The part of the interface that doesn't comply." | the character |
| "The model can't talk its way past a parser." | the proof |
| "Asking is not doing." | the philosophy |
| "There is no un-render." | why it exists at all |
| "A design system an AI can *read* is a suggestion; one it must *pass through* is a guarantee." | the shift |
| "The default is deny, not pass." | the posture |
| "The output looks correct, which is why it ships." | the threat |
| "Free · for startups & individuals · no governance tax" | the position |

## The blocklist

Verified exhausted across 40+ competitor taglines. Never use:

`faster` / `ship faster` / `move faster` (eight competitors race on it) · `beautifully designed`
(shadcn, Tailwind Plus, Headless UI) · `accessible` **as a selling point** (table stakes — Radix,
Chakra, Mantine, Base UI all claim it; we hold a higher bar, so prove it, don't advertise it) ·
`AI-native` · `for the AI era` / `agent era` · `guardrails` (Guardrails AI, NeMo, Galileo) · `secure`
/ `safe` (Okta, Auth0, Oso, Lakera) · `platform` / `layer` / `stack` / `foundation` (saturated) ·
`production-ready` · `build with confidence` · **`trust`** (Vanta owns "Trust is everything";
Salesforce owns "Trust Layer").

**Keep "Constitution" out of brand-facing copy.** GitHub's Spec Kit ships a `constitution.md` and
Anthropic owns Constitutional AI — both meaning *advisory principles a model reads*, the exact
opposite of our runtime-enforced gate. The metaphor stays in the docs and the glossary, where it's
earned and defined. It never carries the brand: out there we'd inherit two incumbents' meaning and
spend the whole sentence fighting our way out of it.

## Voice

**Antithesis is the house style.** Nearly every load-bearing sentence SINA has already written is
built on a turn — *"Validate, then mount. Never mount, then check." · "Asking is not doing." · "The
model proposes JSON, never JSX." · "The default is deny, not pass."* A gate is structurally a turn.
Write like one.

Engineer-terse with a legal spine. Understated, anti-hype, never adjectival — the strongest word in
the corpus is *un-bypassable*. Dry wit, sparingly. Second person, plainspoken. Concede the trade-off
rather than overclaim; *"The trade-off is real"* is on-brand, *"powerful"* and *"seamless"* are not.

## The one known trade-off

The gate doesn't return allowed/denied — it passes, blocks, **or escalates** to a stricter component
(`docs/how-it-works.mdx`: *"Not just yes / no"*). The slogan compresses that, on purpose: a slogan is
a hook, not a spec.

Two things carry the full truth, and they're in the system above — the **mechanism line** ("SINA
*decides* what renders" covers all three outcomes) and the **second beat** ("It says no. Then it says
what instead."). If the slogan is doing its job, one of those is never far behind it.
