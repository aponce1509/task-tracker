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
> - This is the Build node of [[strata-elements]]: it makes the Strata plugin and the strata CLI from one TypeScript source.
> - esbuild bundles `src/` and Pele into two files: `main.js` for Obsidian and `strata.mjs` for Node.
> - Pele comes from `node_modules`, pinned to 1.9.0 in `package.json`, so the plugin and the CLI render the same.
> - `node_modules` is necessary only at build time; the two outputs are self-contained and committed with the vault.
> - Read the diagram from left to right: the build inputs, esbuild, the two outputs, then where each output runs. The strata CLI row sits below the Strata plugin row, so the second output goes down from esbuild.
> - The arrows have no labels. An arrow into esbuild means "is an input of esbuild" (`src` and Pele). An arrow out of esbuild means "is an output of esbuild" (`main.js` and `strata.mjs`). An arrow from an output to Obsidian or Node means "runs in". The Agent runs `strata.mjs` with Node, so its arrow points at Node.

```pele
architecture-beta
  group repo(disk)[Vault repo]
  group plug(server)[Strata plugin folder] in repo
  group nm(disk)[node_modules build time only] in plug
  service src(disk)[src TypeScript] in plug
  service pele(disk)[Pele 1.9.0] in nm
  service esb(server)[esbuild 0.28.2] in nm
  service main(disk)[main.js Strata plugin] in plug
  service cli(disk)[strata.mjs strata CLI] in plug
  service app(internet)[Obsidian]
  service nodejs(server)[Node]
  service agent(internet)[Agent]
  src:R --> L:esb
  pele:B --> T:esb
  esb:R --> L:main
  esb:B --> T:cli
  main:R --> L:app
  cli:R --> L:nodejs
  agent:L --> R:nodejs
```

## Details

- Config: `.obsidian/plugins/strata/esbuild.config.mjs`, two builds from `src/main.ts` and `src/cli.ts`, `bundle: true`, target `es2022`.
- `main.js`: `cjs`, platform `browser`; `obsidian`, `electron`, `@codemirror/*` and `@lezer/*` stay external, because Obsidian gives them at run time.
- `strata.mjs`: `esm`, platform `node`, `#!/usr/bin/env node` banner; it imports only `node:` built-ins, so an agent runs it with plain Node and no install.
- Versions are exact in `package.json` (`devDependencies`): `pele` 1.9.0, `esbuild` 0.28.2, `obsidian` 1.14.4, `typescript` 5.9.3.
- `npm install` once, then `npm run build` or `npm run dev` (watch) in `.obsidian/plugins/strata/`; `npm run typecheck` runs `tsc --noEmit`.
- Committed: `main.js`, `strata.mjs`, `manifest.json`, `styles.css`; `node_modules/` is in the plugin `.gitignore`.
- After a plugin build, reload Obsidian or toggle the plugin; the CLI needs nothing.
