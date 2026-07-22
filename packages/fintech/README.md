# @sina-design-system/fintech

The Fintech constitution for [SINA](https://github.com/stritar/sina) — the free,
governed design system for AI agents. Pure [Zod](https://zod.dev) schemas that
validate an LLM's UI intent **before** anything renders. **No React, no UI** — it
composes [`@sina-design-system/governance`](https://www.npmjs.com/package/@sina-design-system/governance)
and authors the rules.

## Install

```bash
pnpm add @sina-design-system/fintech
```

## Usage

Run the gate **server-side** — the model proposes an intent envelope; the
constitution decides what may render:

```ts
import { evaluateFintechIntent } from "@sina-design-system/fintech";

const envelope = { intent: "wire_transfer", props: { amount: 60000 /* … */ } };

// { valid, violations, requiredComponent } — the uniform interception contract.
const decision = evaluateFintechIntent(envelope);
```

An over-limit transfer never renders a raw confirm — it is forced into
`SecureWireDialog`, which requires a secondary managerial approval the stream
cannot fabricate. The React components that render these decisions live in
[`@sina-design-system/fintech-react`](https://www.npmjs.com/package/@sina-design-system/fintech-react).

Cited thresholds (FinCEN CTR / Travel Rule / SAR), format primitives (ISO 4217,
IBAN, BIC, ABA, Luhn), and adversarial fixtures ship with the package.

## License

MIT © Denis Stritar
