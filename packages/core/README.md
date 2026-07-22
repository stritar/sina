# @sina-design-system/core

Headless, accessible UI primitives for [SINA](https://github.com/stritar/sina) —
the free, governed design system for AI agents. Built on Radix, styled with
co-located CSS Modules that consume [`@sina-design-system/theme`](https://www.npmjs.com/package/@sina-design-system/theme)
tokens. **Domain-agnostic** — no business logic, no governance.

Every primitive meets the SINA a11y bar: focus-trap, correct ARIA, full keyboard
operability, and an automated `axe` pass.

## Install

```bash
pnpm add @sina-design-system/core @sina-design-system/theme
```

`react` and `react-dom` (`^18.2.0 || ^19.0.0`) are peer dependencies.

## Usage

Import the compiled stylesheet once, after the theme tokens:

```ts
import "@sina-design-system/theme/css";
import "@sina-design-system/core/styles.css";
```

```tsx
import { Dialog, DialogContent, DialogTitle, Button } from "@sina-design-system/core";

export function Example() {
  return (
    <Dialog>
      <DialogContent>
        <DialogTitle>Focus-trapped</DialogTitle>
        <Button variant="primary">OK</Button>
      </DialogContent>
    </Dialog>
  );
}
```

Includes Dialog, Button, Field, CurrencyField, TextField, Select, Combobox,
Alert, Badge, Toast, Tooltip, Stack, Grid, SummaryList, and a Chart.js-backed
chart family (LineChart, BarChart, PieChart, DonutChart, KpiStat).

## License

MIT © Denis Stritar
