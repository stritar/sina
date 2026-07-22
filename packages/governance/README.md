# @sina-design-system/governance

The governance seam for [SINA](https://github.com/stritar/sina) — the free,
governed design system for AI agents. Defines the **interception contract** every
domain constitution implements, the intent router, and the audit emit point.

The principle SINA rests on: **the model emits intent and props, never a
component.** Validation runs server-side; SINA validates, then mounts.

## Install

```bash
pnpm add @sina-design-system/governance
```

## The interception contract

Every governance schema returns the same shape, so governance never drifts across
domains:

```ts
interface InterceptionResult {
  valid: boolean;
  violations: Violation[];
  requiredComponent: string | null;
}
```

- **Pass** → `{ valid: true, violations: [], requiredComponent: null }`
- **Fail** → `{ valid: false, violations: [...], requiredComponent: "SecureWireDialog" }`

Every interception — pass or fail — emits a structured, redacting audit event.
This package is domain-agnostic; a domain constitution (e.g.
[`@sina-design-system/fintech`](https://www.npmjs.com/package/@sina-design-system/fintech))
implements it with Zod.

## License

MIT © Denis Stritar
