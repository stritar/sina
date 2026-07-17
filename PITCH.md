# SINA — the elevator pitch

## The one-liner

SINA isn't a design system with governance bolted on. It's a governance layer for AI-generated UI that happens to ship its own components so the governance has something safe to mount.

## The problem it actually solves

When a human writes your UI, you trust them. You review the PR, you know the button does what it says.

When an **AI agent** writes your UI, you don't get that. The model can emit a "Confirm $50,000 wire" button with no approval flow, invent a form that collects a card number it shouldn't, or render an action that skips every check your business requires. It looks fine. It renders fine. And by the time it's on the screen, it's too late to take it back.

Most people solving "AI builds the UI" stop at "make the model output nice React." SINA starts one step earlier and asks: **who checks the model?**

## The core idea in one breath

The model never emits a component. It emits **intent plus props**. That intent hits a schema on the **server** (we call it the Constitution). The schema decides:

- Everything's fine → mount the normal component.
- Something's off → **block it, or force a safer component instead.**

That's the whole trick, and the order matters: **validate first, then mount.** Once a React Server Component has streamed to the browser, you can't un-render it. So the check has to happen *before* anything mounts, and it has to happen server-side, where the model can't tamper with it. Client-side checks are just UX sugar. The real gate is on the server.

## Why it's not "just overengineered React"

A normal component library answers "what does this button look like?"

SINA answers a different question: **"the AI wants to show this to a user. Should it be allowed to, and if not, what should it show instead?"**

The part that makes that real, and that you can't get from shadcn plus a Radix wrapper:

1. **Governance is a router, not just a blocker.** When an agent tries an over-limit transfer, SINA doesn't throw an error. It swaps in a `SecureWireDialog` that forces the approval flow. The gate *escalates the UI to a safer version of itself*. That's the interesting move.

2. **The rules are a portable artifact, decoupled from the UI.** An industry's constitution (`fintech`, and later `defense`, `health`, whatever) is **pure Zod**. No React, no components, no styling. The rulebook is a standalone package you could reason about, test, and audit without ever rendering a pixel. The same components can run under a completely different constitution.

3. **The whole thing assumes an untrusted author.** Every other component library assumes a trusted developer wrote the code. SINA assumes a model did, and builds the trust boundary accordingly. That single assumption is why it exists.

## The honest part

Yes, SINA also ships a full design system: accessible primitives, a token system, dark mode, i18n, the works. That part is well-built but it's table stakes. It's not the point. It's there so the governance layer has trustworthy components to mount when it says "yes."

Think of it this way: **the design system is the least interesting thing SINA does. It's the price of admission, not the product.** The product is the gate in front of it.

## The 10-second version

> SINA lets startups adopt AI-generated UI without building the safety layer themselves. The AI proposes; a server-side constitution decides; and when the answer is "no," SINA doesn't just block, it mounts the governed version instead. It's free, because the hard part shouldn't be a paywall.
