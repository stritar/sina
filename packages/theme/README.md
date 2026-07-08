# @sina-design-system/theme

Design tokens for [SINA](https://github.com/stritar/sina) — the free, governed
design system for AI agents. Ships the `--sina-*` CSS custom properties and a CSS
reset. **No React, no Tailwind.**

This is the foundation layer: every `core` primitive and every app styles itself
by consuming these tokens, and rebranding happens by reassigning them — never by
editing components.

## Install

```bash
pnpm add @sina-design-system/theme
```

## Usage

Import the reset and token layers once, at your app root, in order:

```ts
import "@sina-design-system/theme/reset.css"; // layered @layer reset
import "@sina-design-system/theme/css"; // the --sina-* custom properties
```

Then consume tokens in your own CSS:

```css
.card {
  padding: var(--sina-space--5);
  border-radius: var(--sina-radius--lg);
  background: var(--sina-color-surface);
  color: var(--sina-color-text);
}
```

Dark mode is a `[data-theme="dark"]` block that only reassigns `--sina-*` vars —
a brand theme is just another such block. The typed emitters `createTheme()` /
`themeVars()` are exported from the package entry.

## License

MIT © Denis Stritar
