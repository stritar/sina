# SINA — The Line Bank

The working bench. `BRAND.md` is the **canon** — short, decided, closed. This file is the **candidates** —
raw, unresolved, pickable. Lines get promoted *from* here *to* there once they've earned it in the wild.

Rule of thumb: if you're writing something public and a line already exists in `BRAND.md`, use that. If the
slot is empty, take one from here. If you're about to invent a new one, check the **Already taken** appendix
at the bottom first — roughly twenty good lines are already in service across the docs, the READMEs, and the
live hero, and re-deriving one is a wasted slot.

**Every line below was written against the `BRAND.md` filters:** the blocklist is absolute, "Constitution"
stays out of brand-facing copy, antithesis is the house style, and the "can" in *can say no* never gets
dropped. One deliberate note: `trust` is blocklisted, so lines that would naturally say "a component library
*trusts* whoever calls it" are written around it — the word is Vanta's and Salesforce's, even in the verb.

---

## 1 · Slogan slot

Alternates to **"The design system that can say no."** The incumbent is strong and probably stays. These
exist so it's a *choice* rather than a default — pressure-test it once a quarter, then keep it.

| Line | Job |
|---|---|
| The design system with a veto. | shortest possible compression; "veto" carries the legal spine the slogan wants |
| The design system your model has to get through. | reframes SINA as an obstacle *to the model*, not to you |
| The design system that answers to you, not the model. | for audiences who fear losing control to the agent |
| Components an AI can use. Rules it can't. | the two-beat turn; says the whole architecture in six words |
| The design system that doesn't take the model's word for it. | the skeptic's framing; understated, very on-voice |
| The design system that renders last. | methodology *as* slogan — the order is the product |
| The design system that reads the request before it renders it. | most literal; good where the audience is technical and cold |
| Not what the model asked for. What your rules allow. | pure antithesis; works as a two-line hero |
| The design system where "no" is a feature. | the "can" insight, said plainly; good for a skeptical dev audience |
| Every component your agent needs. One decision it doesn't get to make. | concedes the library is real before landing the turn |

## 2 · Campaign / category attack

The **"Every other design system says yes."** family — your confirmed launch line. These are its siblings:
they all work by naming what the category *doesn't* do. Use one per surface; they cannibalize each other if
stacked.

| Line | Job |
|---|---|
| They ship you the parts. We ship the part that refuses. | the cleanest sibling to the launch line |
| Everyone is making it easier for a model to render. We made it harder. | the contrarian flex; strongest on HN |
| A component library does whatever the caller says. That was fine when the caller was you. | the whole thesis as a two-beat; probably the best line in this file |
| Your design system has no idea who's calling it. | accusatory, second person, six words; a great subject line |
| Every design system is a suggestion until something enforces it. | the shift, stated as a law |
| They wrote the rules in a README. We wrote them in the render path. | concrete, engineer-legible, no metaphor |
| The category solved what your UI looks like. Nobody solved what it's allowed to do. | the category gap in one sentence |
| A style guide a model can ignore is a style guide a model will ignore. | the inevitability framing; dry |
| Forty design systems. Not one of them will stop you. | numeric, flat, faintly menacing |
| Every other design system was built for a caller who meant well. | the assumption nobody noticed they were making |
| The others hand the model a box of parts. We hand it a checkpoint. | most explicit; use where the audience needs the mechanism |
| Nobody else's design system has ever declined anything. | the launch line's cousin; more literal, less quotable |
| They made the model fluent. Nobody made it accountable. | works beyond design systems — good for a talk title |
| Every design system in the category sits downstream of the model. We put one upstream. | for architecture-literate readers |
| Autocomplete for interfaces. Nobody shipped the review. | the code-review analogy; instantly legible to any dev |

## 3 · Methodology beats

The **"Validate, then mount."** family. Per `BRAND.md`, the methodology is worth more than the slogan — a
slogan gets admired, a methodology gets adopted. These are the lines that make the term of art *do work*
rather than just appear.

| Line | Job |
|---|---|
| Mount-then-check is a rollback you can't run. | names the anti-pattern in the reader's own vocabulary |
| Every failure in agentic UI is a check that ran one step too late. | the universal claim; the strongest of these |
| Validate, then mount. The order is the whole product. | says why the comma matters |
| Check after the mount and you're not validating — you're apologizing. | dry wit, used sparingly, exactly as the voice allows |
| The check has to be older than the render. | temporal framing; oddly memorable |
| A check in the browser is a preference. A check on the server is a rule. | the client/server point without the security vocabulary |
| If a check can run after the render, it was never a check. | the definitional turn |
| Mounting isn't the decision. It's the receipt. | reframes render as *consequence*, not action |
| The render is a commitment. Make it the last thing you do. | second person, imperative, plain |
| Every other check in your app runs before the write. This one runs before the render. | maps onto DB constraints — lands instantly with backend people |

## 4 · Social / launch hooks

Longer, for LinkedIn / HN / talk openers. The register of the proven **"Everyone's racing to let AI generate
the interface. SINA decides whether it should."** — which stays the bar these have to clear.

| Line | Job |
|---|---|
| The danger was never the AI rendering the wrong screen. It's that the wrong screen looks right. | the threat, restated; probably your best social opener |
| Your agent can ask for anything. That was never the problem. | sets up the reveal; pairs with the docs' "Asking is not doing." |
| We spent a decade making sure a user couldn't do the wrong thing. Then we handed the keyboard to a model. | the historical turn; lands with anyone who's shipped software |
| Everyone is demoing what their agent can build. Nobody is demoing what it tried to build and wasn't allowed to. | the demo-culture attack; very shareable |
| The most important component in an agentic interface is the one that never renders. | the paradox hook |
| Give a model a component library and it will use every component in it. | flat, obvious once said, faintly damning |
| If your rule lives in a prompt, it isn't a rule. It's a request. | the prompt-vs-parser point, compressed for social |
| Ask any team shipping agentic UI where the check runs. Watch them think about it for the first time. | the uncomfortable question; good talk opener |
| The interesting question in agentic UI isn't what the model can render. It's who gets to say no. | ties the whole category back to the slogan |
| An interface nobody approved is still an interface your users will act on. | the consequence, stated without drama |

## 5 · Closers

Sign-offs. README last lines, slide ends, CTA subtext.

| Line | Job |
|---|---|
| Nothing renders until it passes. | the flattest possible statement of the product |
| Build the agent. We'll handle the no. | the friendly close; concedes you're not in the agent business |
| Your rules, your server, your call. | second-person ownership, three beats |
| Start with one rule. The rest can wait. | the adoption close; pairs with the incremental-adoption doc |
| Ship the agent. Keep the veto. | the CTA that keeps the slogan's word alive |

## Swings

Deliberately outside the current register — sharper, more metaphorical, or funnier than SINA has been so
far. **Not** approved by the voice as written; here so you can see where the edges are. The bouncer/customs
metaphor lane is entirely unused in the codebase, for what it's worth.

- Every design system is a bouncer that's never once checked an ID.
- It's not a component library. It's a customs desk.
- The model files a request. SINA is the clerk who's actually read the regulation.
- Your AI is an intern with root access and excellent handwriting.
- Somewhere in your app, an LLM is about to render a button that moves $60,000. It will look great.

---

## Appendix · Already taken — don't reinvent

These are **in service**. They are not candidates, and a "new" line that merely re-cuts one of them is a
wasted slot. Check here before writing.

| Line | Home |
|---|---|
| The design system that can say no. | `BRAND.md` — the slogan |
| The model proposes; SINA decides what renders. | `BRAND.md` — the mechanism line |
| Validate, then mount. Never mount, then check. | `BRAND.md`, `ROADMAP.md` §1b, `how-it-works.mdx` — the methodology |
| The governed design system for AI agents. | `BRAND.md`, README, all package READMEs — the category |
| Every other design system says yes. | `BRAND.md` — **the launch line** |
| It says no. Then it says what instead. | `BRAND.md` — the second beat |
| Everyone's racing to let AI generate the interface. SINA decides whether it should. | `BRAND.md` — the long hook |
| The model emits intent — SINA decides what renders. | the live hero, `apps/web/app/(marketing)/page.tsx` |
| The model proposes; the server decides; the screen shows only what passed. | `index.mdx`, FlowDiagram caption |
| There is no un-render. | `how-it-works.mdx` — why it exists at all |
| A design system an AI can *read* is a suggestion; one it must *pass through* is a guarantee. | `agents.mdx` — the shift |
| Asking is not doing. | `agents.mdx` — the philosophy |
| The model can't talk its way past a parser. | `governance/index.mdx` — the proof |
| The output looks correct, which is why it ships. | `index.mdx` — the threat |
| The default is deny, not pass. | `components-and-patterns.mdx` — the posture |
| A block is never a mystery. | `governance/index.mdx` |
| Governance escalates; it doesn't just refuse. | `governance/wire-transfer.mdx` |
| A design system, not just a policy engine. | `how-it-works.mdx` |
| If you can't cite it, don't encode it. | `governance/writing-a-rule.mdx` |
| A rule isn't done when it compiles; it's done when a hostile request can't get past it. | `writing-a-rule.mdx`, `extend-sina.mdx` |
| The guarantees can't quietly rot. | `governance/index.mdx` |
| It's refusing well. | `BRAND.md` — the thesis |
| The part of the interface that doesn't comply. | `BRAND.md` — the character |
| Free · for startups & individuals · no governance tax | `BRAND.md` — the position |
