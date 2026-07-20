---
name: figma-inspect
description: The mandatory inspection protocol before implementing ANY Figma node — walk every exposed node and parameter, reconcile the geometry, identify icons from their SVG paths, and map every raw value to a --sina-*/--sinamk-* token before writing a line of code. Use whenever a Figma URL or node id appears in the request, when asked to "implement this design", "match the Figma", "redesign X per Figma", "check every detail/padding/gap/size/radius", or as step 0 of /primitive-figma-sync and /marketing-figma-sync.
---

> **The invariant:** you do not write code from a Figma screenshot. You write it from a **reconciled measurement table** in which every value has been read off a node, checked against its neighbours' arithmetic, and mapped to a token. A value you did not read is a value you guessed, and a guessed value is the reason a "pixel-perfect" implementation quietly drifts.

This is the *reading* half of the Figma workflow. `/primitive-figma-sync` and `/marketing-figma-sync` are the *writing* half; `/figma-component-coverage` is the acceptance test. Run this first, every time.

## Why this exists

The failure mode is not laziness, it is **plausibility**. `get_design_context` returns clean Tailwind that looks like a complete answer, so it is tempting to translate it and stop. But that output silently omits things that change the implementation:

- **Icons arrive as `<img src={imgVector} />`.** The generated code cannot tell you the glyph is `PlusCircle` at `weight="fill"` rather than `Plus` at `regular`. Only the SVG path can.
- **`get_variable_defs` returning `{}`** looks like "no answer". It is an answer: **nothing is variable-bound**, so every number and colour is a raw literal that needs a token decision (and possibly a sign-off).
- **A near-miss colour** (`#FCFCFC` where the token is `#ffffff`) is invisible on screen but fails the foundations guard if copied literally, and hides a real design intent if snapped without comment.
- **Frames vs components.** The node in the URL is often a loose mockup frame, while a *component set* of the same thing already exists elsewhere in the file and is what actually has to be updated.

## The protocol

Run steps 1-7 before writing code. Do not skip a step because the node "looks simple".

### 1. Extract, never guess

Pull `fileKey` and `nodeId` from the URL (`/design/:fileKey/:name?node-id=1-2` → nodeId `1:2`). If there is no `node-id`, ask for a node-specific URL. Never pass a guessed or empty node id.

### 2. `get_metadata` — the geometry, then reconcile it

Record **every** descendant's `x / y / width / height`, not just the root's. Then **do the arithmetic out loud** and check it closes:

```
padding-inline + child₁ + gap + child₂ + gap + … + padding-inline == root width
```

A sum that does not close means you misread a padding, a gap, or a hidden node. Chase it before continuing. This reconciliation is also how you recover values the codegen rounds or omits.

Do the same on the block axis, and note that **Figma strokes are drawn inside the frame**: a 48px-tall frame with 12px padding around a 24px child means the stroke overlaps the padding. A CSS `border` would make that 50px. Use an inset ring (`box-shadow: inset 0 0 0 1px`) when the exact outer size matters.

### 3. `get_design_context` — on the root **and on every child instance**

The root call gives you fills, strokes, radii, padding, gap, and type. Then call it again **on each nested instance/component node id** the metadata exposed. Nested instances carry their own fills and padding that the parent's output flattens or drops.

### 4. `get_variable_defs` — and treat `{}` as a finding

If it returns bindings, use them: they are the design's own token names and should map 1:1 to ours. If it returns `{}`, say so explicitly in your notes and record that **every value is raw**. Then map each raw value to the nearest existing token, and list separately any value with **no token home** — minting a `--sinamk-*`/`--sina-*` token needs the user's sign-off (see `/broadsheet-foundations`).

### 5. `get_screenshot` at high `maxDimension`

For visual truth, and to catch anything structural the node tree does not express (optical alignment, overlap, a glyph that is not what its layer name claims). Also screenshot the **ancestor** frame so you see the node in context.

### 6. Download every vector asset and read the SVG

This is the step people skip and the one that most often produces a wrong implementation.

```bash
curl -sL -o glyph.svg "https://www.figma.com/api/mcp/asset/<id>"
```

From the file, determine:

- **Which glyph it is** — match the path against the icon library actually in use (`@phosphor-icons/react`), not against your memory of the thumbnail.
- **Which weight** — a **single compound `<path>`** (a solid shape with the symbol cut out of it) is a `fill` weight; multiple stroked paths are `regular`/`bold`. `PlusCircle` fill and `Plus` regular look nearly identical at 16px and are different components.
- **Its literal fill** — `fill="var(--fill-0, #353B31)"` gives you the exact colour, which is how near-misses surface.
- **Its viewBox inset** — e.g. a `14 × 12.44` viewBox inside a 16px frame is the `inset-[11.11%_6.25%]` you saw in the codegen, and tells you the glyph's true optical size.

### 7. Walk up and sideways

Fetch the parent page's metadata and locate the node's **ancestors and siblings**. Establish:

- Is this node a **loose mockup frame** or a **component instance**?
- Does a **component set for this thing already exist** in the file? If so, that set (and its `Coverage / …` frame) is what the sync must update, and the mockup frame is only the reference.
- Which **other instances** in the file will change when the component does.

### 8. Write the table before the code

Produce a measurement table with a **token column** and hand it to the user (or put it in the plan) before implementing:

| Property | Figma value | Token | Note |
| --- | --- | --- | --- |
| gap | 12px | `--sinamk-space--md` | |
| radius | 8px | `--sinamk-radius--lg` | |
| send glyph fill | `#FCFCFC` | `--sinamk-color-primary-fg` (`#ffffff`) | near-miss, snapped deliberately |
| send button box | 24px | *(none)* | needs sign-off or a local override |

Every deviation from the literal file gets a row and a reason. **Never snap a value to a token silently**, and never carry a raw literal into a component module just because the file had one.

## Checklist

- [ ] `fileKey` + `nodeId` extracted from the URL, not guessed
- [ ] `get_metadata` run; every descendant's box recorded
- [ ] Inline **and** block geometry reconciles against the root
- [ ] `get_design_context` run on the root **and every nested instance**
- [ ] `get_variable_defs` run; `{}` recorded as "raw values, unbound"
- [ ] High-resolution screenshot of the node **and** its ancestor
- [ ] Every vector asset downloaded; glyph **and weight** identified from path data
- [ ] Ancestors/siblings checked for an existing component set to update
- [ ] Measurement table with a token column written before any code
- [ ] Every deviation (near-miss colour, missing token, stroke inset) flagged explicitly
