# @sina-design-system/fintech-react

Governed fintech components for [SINA](https://github.com/stritar/sina) — the
free, governed design system for AI agents. The **third layer**: each component
composes a [`@sina-design-system/core`](https://www.npmjs.com/package/@sina-design-system/core)
primitive with a [`@sina-design-system/fintech`](https://www.npmjs.com/package/@sina-design-system/fintech)
schema and renders the decision the gate already made.

These components **never validate a payload** — the gate stays server-side. They
render the component the constitution forced (e.g. `SecureWireDialog` on an
over-limit transfer) or a presentational read.

## Install

```bash
pnpm add @sina-design-system/fintech-react @sina-design-system/core \
  @sina-design-system/fintech @sina-design-system/governance @sina-design-system/theme
```

`react` and `react-dom` (`^18.2.0 || ^19.0.0`) are peer dependencies.

## Usage

```ts
import "@sina-design-system/theme/css";
import "@sina-design-system/core/styles.css";
import "@sina-design-system/fintech-react/styles.css";
```

Gate an intent on the server, then mount the decision — the model never chooses
the component. See the [SINA docs](https://github.com/stritar/sina) for the full
validate-then-mount flow.

## License

MIT © Denis Stritar
