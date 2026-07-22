# Changesets

This folder holds [changesets](https://github.com/changesets/changesets) —
one Markdown file per intended change, describing which `@sina-design-system/*`
packages it bumps and by how much.

- Add one with `pnpm changeset` and commit it with your PR.
- On merge to `main`, the release workflow opens a **Version PR** that consumes
  the changesets, bumps versions, and writes CHANGELOGs. Merging that PR publishes
  to npm.
- Private packages (`config`, `governance-demo`) and the apps (`web`,
  `playground`) are never published.
