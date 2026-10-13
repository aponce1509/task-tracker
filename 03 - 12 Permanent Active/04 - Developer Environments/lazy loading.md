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
# [[lazy loading]]

> [!abstract]
> Lazy loading defers the load cost of a component until its first use. In lazy.nvim, a lazy plugin stays on disk until a trigger of its spec fires (`event`, `cmd`, `ft`, `keys`). Then lazy.nvim adds the plugin directory to the runtimepath and runs `config`. Startup time counts only the eager plugins.

## Definition

Let $P$ be the set of plugins, $E \subseteq P$ the eager plugins, $L = P \setminus E$ the lazy plugins, and $t_p$ the load time of plugin $p$.

Lazy loading is the strategy that loads $p \in L$ at its first use, not at startup. The startup time is then
$$T = \sum_{p \in E} t_p \quad\text{instead of}\quad T = \sum_{p \in P} t_p$$
The cost $t_p$ of a lazy plugin moves to the moment of its first trigger.

In lazy.nvim, a plugin is lazy when its spec sets `lazy = true` or sets one of these triggers:

- `event`: an autocommand event, for example `BufReadPre` or `VeryLazy`.
- `cmd`: an Ex command, for example `:Telescope`.
- `ft`: a filetype, for example `python`.
- `keys`: a key mapping, for example `<leader>ff`.

A `require` of a module of a lazy plugin also loads that plugin.

## Properties

- At startup, lazy.nvim registers only stubs for the triggers: autocommands, user commands, key mappings. The plugin directory is not on the runtimepath yet.
- When a trigger fires, lazy.nvim loads the `dependencies` first, adds the plugin directory to the runtimepath, sources its `plugin/` files, and runs `config`. Then it replays the original event, command or key.
- `init` runs at startup for every plugin, lazy or not. `config` runs only at load.
- A plugin that other plugins need at startup (a colorscheme, for example) must stay eager.

## Links

- Part of [[lazy.nvim plugin spec]]
- Uses [[runtimepath]]: the plugin directory joins it only when a trigger fires
- Source: [[lazy.nvim explained - TJ video]]
