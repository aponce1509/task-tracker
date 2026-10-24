---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - deployment|deployment]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 12:00
---
# [[strata-elements-build]]

> [!abstract] Build and ship
> - esbuild bundles two outputs from one source folder: the plugin `main.js` and the CLI `strata.mjs`.
> - Pele is pinned to an exact version and bundled into both, so the plugin and the CLI render the same.
> - The outputs are committed with the vault; `node_modules` is ignored.

```pele
architecture-beta
  group repo(disk)[Vault repo]
  group plug(server)[.obsidian/plugins/strata] in repo
  service src(disk)[src ts] in plug
  service esb(server)[esbuild] in plug
  service main(disk)[main.js] in plug
  service cli(disk)[strata.mjs] in plug
  service app(internet)[Obsidian]
  service node(server)[Node agents]
  src:R --> L:esb
  esb:R --> L:main
  esb:B --> T:cli
  main:R --> L:app
  cli:R --> L:node
```

## Details

- `npm install` once, then `npm run build` or `npm run dev` (watch) in `.obsidian/plugins/strata/`.
- `npm run typecheck` runs `tsc`.
- After a plugin build: reload Obsidian or toggle the plugin; the CLI needs nothing.
