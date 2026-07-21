# SINA demo — the fake banking app, for friends

A quick script for showing SINA off in the playground. Every scenario below is **already canned** in the app, so you just pick it from a dropdown and watch what happens. No API key, no typing.

The whole point in one sentence: **an AI agent emits an _intent_ (send money, show my cards), never a finished screen. SINA validates that intent server-side, then either mounts a real, checked component or blocks it. It can't un-draw something it already streamed, so it gates _first_.**

---

## How to run it

1. From the repo root: `pnpm dev` (this builds the component libraries and starts the app together — a bare `pnpm --filter playground dev` can serve stale library output, so use root `pnpm dev`).
2. Open **http://localhost:3001**.
3. Set the emulator to **Mock mode**. Mock mode runs the real governance gate on canned payloads, deterministically, with no model in the loop. Perfect for a demo.
4. Point your friends at the **two panes**:
   - **Left = the app** (what a user would actually see in the chat).
   - **Right = the console X-ray**: `Intent received → Schema gate → Policy → Decision → Audit`. This is the reveal. "Watch the right side catch what the left side was about to render."
5. The picker has a **Governed / Ungoverned** toggle and a scenario dropdown. Quick-pick chips show first.

Run it as three acts.

---

## Act I — SINA _replaces_ the model's output with a real component

Ungoverned "read" intents. The agent asked to show data; SINA validated the data and **mounted a real `fintech-react` component** instead of trusting the model to draw one. Look for the **"validated by SINA"** badge above each render.

| Pick (Ungoverned) | Say to your friend | What appears |
|---|---|---|
| `dashboard` | "Give me an overview of my finances." | Composed view: balance + recent transactions + spending. The model didn't draw any of this — SINA mounted three validated components. |
| `list-transactions` | "Show my last two transactions." | A `TransactionList`: Everyday Checking ****4021, Invoice #4471 −$1,250, Refund #221 +$80. |
| `account-balance` | "What's my balance?" | A `BalanceCard`. |
| `spending-breakdown` | "Where did my money go this month?" | A `SpendingBreakdown` chart. |
| `budget-progress` | "How am I tracking against my budget?" | A `BudgetProgress` bar. |
| `list-cards` | "Show my cards." | A `CardList` — note the card numbers are **masked** (****). SINA won't render them any other way (see Act II). |
| `rewards-summary` | "How many points do I have?" | A `RewardsSummary`. |
| `list-payees` | "Who can I pay?" | A `PayeeList`. |
| `upcoming-payments` | "What bills are coming up?" | An `UpcomingPayments` list. |
| `portfolio-holdings` | "Show my investments." | A `PortfolioHoldings` table. |
| `watchlist` | "What's on my watchlist?" | A `Watchlist`. |

**The line:** "None of these were drawn by the AI. It just said _show transactions_. SINA checked the data against a schema and mounted its own component. The AI never touches the pixels."

---

## Act II — SINA _blocks_ a bad render

Same "read" intents, but the payload is dirty — the model tried to sneak something past. The gate rejects it, and the left pane shows a red **"Stream intercepted"** alert with a violation badge instead of the component. Check the right pane: the schema gate flips to **rejected**, and the audit still logs it.

| Pick (Ungoverned) | What the model tried | Result |
|---|---|---|
| `cards-unmasked` | Render a **full card number** (`4021401540214021`) instead of `****`. | Blocked — the mask rule rejects a raw PAN. |
| `payees-unmasked` | Show a payee's **full account number**. | Blocked — same masking rule. |
| `transactions-fabricated-row` | Smuggle a **clickable action button** into a read-only transaction list. | Blocked — a read can't carry an action (`.strict()`). |
| `budget-zero-limit` | A budget with a **zero limit** (would divide-by-zero / render nonsense). | Blocked — shape guard. |
| `rewards-fractional` | **Fractional** reward points (`1234.5`). | Blocked — points are integers. |
| `watchlist-flood` | A watchlist with **101 items** (UI flood). | Blocked — capped at 100. |
| `unknown-intent` | Emit a made-up capability: **`teleport_funds`**. | **Default deny.** No rule is registered, so nothing mounts and it's audited. Crowd-pleaser. |

**The line:** "The AI asked to show a card and tried to print the full number. SINA doesn't have a rule that _allows_ that, so it never renders. Nothing the model does can get an unmasked card onto the screen."

---

## Act III — SINA _escalates_ a risky action to a governed step

Governed intents. These are normal things a person does — send money, dispute a charge, cancel a card — but they're risky enough that SINA won't let the agent just _do_ them. Instead of executing, the gate **forces a governed dialog** to mount (labeled "Forced governed component"), so the human completes a real second step.

| Pick (Governed) | Say to your friend | What happens |
|---|---|---|
| `p2p-payment` | "Send $10,000 to @jordan." | Over the $2,500 P2P step-up line → mounts a step-up dialog instead of sending. |
| `dispute` | "Dispute that $420 charge, it wasn't me." | Requires identity + evidence → step-up dialog. |
| `card-control` | "Cancel my Personal Debit card." | A destructive action → step-up before it happens. |
| `security-change` | "Change my password." | Requires 2FA → step-up. |
| `link-account` | "Link my First National checking account." | Requires explicit consent → consent step-up. |
| `withdraw` | "Withdraw a large amount of cash." | Over the withdrawal limit → escalation. |

More of the same if you want extras: `bill-pay`, `recurring-setup`, `fx-convert`, `crypto-withdraw`.

**The line:** "The AI can _propose_ sending ten grand. It can't _send_ it. SINA turns a risky intent into a real approval step, every time, without the app developer writing that logic."

### And if the model tries to skip the step

The `-reject` twins show the harder block: the model fabricates its own confirmation to self-authorize, and SINA rejects the whole payload.

| Pick (Governed) | What the model tried | Result |
|---|---|---|
| `link-account-reject` | Smuggle a raw **`password: "hunter2"`** into the link request. | Blocked — raw credentials never belong on an intent, and it's dropped from the audit log entirely. |
| `p2p-payment-reject` | Attach its own fake **"Send now"** button to self-approve the $10k. | Blocked (`.strict()`). |
| `dispute-reject` | Attach a fake **"Confirm"** button. | Blocked. |
| `card-control-reject` | Attach a fake confirm button. | Blocked. |
| `security-change-reject` | Attach a fake confirm button. | Blocked. |

**The line:** "The AI tried to draw its own _Send now_ button to skip approval. SINA rejects the whole thing. The model doesn't get to authorize itself."

---

## The three things to leave them with

1. **The model emits intent, never a component.** It says _show cards_ or _send $10k_ — it never hands over a screen.
2. **SINA validates server-side, then mounts.** A streamed pixel can't be recalled, so the schema gate sits _before_ anything renders. Validate, then mount — never the other way around.
3. **Every decision is audited.** The right-hand pane is the receipt: what came in, what rule fired, what got mounted or blocked.

That's the pitch: a governed design system for AI agents, so an app can safely let a model drive its UI.
