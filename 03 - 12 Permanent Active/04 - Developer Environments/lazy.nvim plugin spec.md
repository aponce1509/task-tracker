---
paras: ["[[04_developer_environments]]"]
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done
maturity: capture
created: 2026-10-14 10:00
---
# [[lazy.nvim plugin spec]]

> [!abstract]
> A plugin spec is a Lua table that declares one plugin for lazy.nvim: its source, its options and when it loads. lazy.nvim collects the specs, clones each plugin into `stdpath("data")/lazy/` and adds it to the runtimepath. With `{ import = "plugins" }`, each module in `lua/plugins/` returns its specs, so the plugin list is split over files.

## Definition

Let $S$ be the set of specs given to `require("lazy").setup({ spec = ... })`. A spec $s \in S$ is a table $s = (r, o, c, D, T)$:

- $r$: the repo string `"owner/name"` (first positional field), the GitHub source.
- $o$: `opts`, a table passed to `require(<main>).setup(o)` by the default config.
- $c$: `config`, a function `function(plugin, opts)` that runs when the plugin is loaded. It replaces the default `setup(opts)` call.
- $D$: `dependencies`, a list of specs that load before $s$.
- $T$: the triggers `event`, `cmd`, `ft`, `keys`. When $T \neq \emptyset$, the plugin is lazy loaded.

An import spec `{ import = "<mod>" }` is not a plugin. lazy.nvim resolves `<mod>` with `require` and reads every module in `lua/<mod>/`. Each module returns one spec or a list of specs.

## Properties

- For each $s$, lazy.nvim clones $r$ into `vim.fn.stdpath("data") .. "/lazy/<name>"` and prepends that path to the runtimepath when $s$ loads.
- `config` runs at load time, not at `setup` time.
- `opts` alone is enough for most plugins; `config` is for custom logic.

## Example

```lua
-- lua/plugins/telescope.lua
return {
  "nvim-telescope/telescope.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },
  cmd = "Telescope",
  opts = { defaults = { layout_strategy = "flex" } },
}
```

## Links

- Uses [[lua require resolution]] (`{ import = "plugins" }` loads every module in `lua/plugins/`)
- Comes after [[lazy.nvim bootstrap]]
- Its `event` / `cmd` / `ft` / `keys` fields drive [[lazy loading]]
- Source: [[lazy.nvim explained - TJ video]]
