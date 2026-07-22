```
                     ░░▒▒▒▒▓▒░                   ░▒▒▓▓▓▒▒▒▒░░
                ░▒▓▓▓████████▓             ░▒▒▓▓█████████████▓▓▓▒░
             ▒▓▓███████▓▓▓▓▒▒░       ░▒▒▓▓████████▓▓▓▒▓▓▓▓▓███████▓▓▒
          ▒▓██████▓▒▒░         ░▒▒▓▓█████████▓▓▒░           ░▒▒▓██████▓▒
        ▒▓█████▓▒     ░▒▒▓▓▓▓▓█████████▓▓▒░     ░▒▒▓▓▓▓▓▓▒▒░     ▒▓█████▓▒
      ░▓████▓▒    ░▒▓████████████▓▓▒░     ░▒▒▓▓██████████████▓▒░    ▒▓████▓░
     ▒████▓▒    ▒▓██████▓▓▒▒▒▒░     ░▒▒▓▓████████▓▓▒▒▒▒▒▓▓██████▓▒    ▒▓████▒
    ▓████▓    ▒█████▓▒░       ░░▒▓▓████████▓▓▒▒░           ░▒▓█████▒    ▓████▓
   ▒████▒    ▓████▓░    ▒▒▓▓▓████████▓▓▓▒░      ▒▒▓▓█▓▓▓▒▒    ░▓████▓    ▒████▒
  ░████▓    ▓████▒   ░▓█████████▓▓▒░      ░▒▓▓█████████████▓    ▒████▓    ▓████░
  ▓████    ▓████▒   ░█████████░     ░▒▒▓▓████████████████████░   ▒████▓    ████▓
  ████▓    ████▓    ██████████▓▒▒▓▓███████████████████████████    ▓████    ▓████
  ████▒   ░████▒   ░██████████████████████████████████████████░   ▒████░   ▒████
  ████▓    ████▓    ███████████████████████████▓▓▒▒▓██████████    ▓████    ▓████
  ▓████    ▓████▒   ░▓███████████████████▓▓▒▒░     ░████████▓░   ▒████▓    ████▓
  ░████▓    ▓████▒    ▒▓███████████▓▓▓▒░     ░▒▒▓▓████████▓▒    ▒████▓    ▓████░
   ▒████▓    ▓████▓▒    ░▒▓▓▓▓▓▓▒░     ░░▒▓▓█████████▓▓▓▒░    ▒▓████▓    ▒████▒
    ▒████▓░   ▒▓████▓▒▒           ░▒▓▓█████████▓▓▒░        ▒▒▓████▓▒    ▓████▒
     ▒█████▒    ▒▓██████▓▓▓▒▒▒▒▓▓████████▓▓▒░      ░▒▒▒▓▓▓██████▓▒    ▒█████▒
       ▓█████▒░   ░▒▓▓█████████████▓▓▒▒░     ░▒▒▓▓██████████▓▓▒░    ▒▓████▓░
        ░▓█████▓▒░    ░░▒▒▓▓▓▓▓▒▒░     ░▒▒▓▓████████▓▓▓▓▒▒░░    ░▒▓█████▓▒
          ░▒▓█████▓▓▒░            ░▒▓▓████████▓▓▒▒░         ░▒▓▓██████▓░
             ░▒▓████████▓▓▓▓▒▒▒▓▓████████▓▓▒░       ░▒▓▓▓▓▓███████▓▓▒
                 ▒▒▓▓██████████████▓▓▒▒░            ▓████████▓▓▒▒░
                      ░░▒▒▒▓▓▓▓▒▒░                  ░▒▒▒▒▒░░
```

# SINA

**The governed design system for AI agents.**

[![npm](https://img.shields.io/npm/v/%40sina-design-system%2Fcore?label=npm)](https://www.npmjs.com/org/sina-design-system)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

An LLM never renders anything in SINA. The model emits intent as JSON, Zod schemas validate that intent on the server, and only then does an accessible React component mount. A refusal doesn't render an error; it renders the stricter component the rule requires.

**Validate, then mount. Never mount, then check.**

SINA is free and built for startups and individuals who want agentic UI generation with governance built in, without writing that machinery themselves.

## Packages

| Package | What it is |
| --- | --- |
| `@sina-design-system/theme` | Design tokens and the CSS reset. No React. |
| `@sina-design-system/core` | Headless, accessible React primitives on Radix. No domain logic. |
| `@sina-design-system/governance` | The shared interception contract and the Zod intercept engine. |
| `@sina-design-system/fintech` | The fintech rules: pure Zod schemas, no UI. |
| `@sina-design-system/fintech-react` | Governed fintech components: core primitives composed with the fintech rules. The gate stays server-side; these render its decision. |

## Quickstart

```sh
pnpm add @sina-design-system/core @sina-design-system/theme
```

The full walkthrough, including the server-side gate and a governed wire-transfer flow, is in the docs: **[sinahub.app/docs/quickstart](https://sinahub.app/docs/quickstart)**.

- Docs and live demo: [sinahub.app](https://sinahub.app)
- How it works: [sinahub.app/docs/how-it-works](https://sinahub.app/docs/how-it-works)
- For agents: [sinahub.app/llms.txt](https://sinahub.app/llms.txt)

## Status

Early, and honest about it: this is 0.x and public APIs may change in any minor release. Fintech is the only domain with real rules today. The changelog is the source of truth: [Releases and stability](https://sinahub.app/docs/reference/changelog).

## License

MIT. Free to use, fork, and build on.. See [LICENSE](LICENSE).
