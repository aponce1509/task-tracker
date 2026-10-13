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
# [[runtimepath]]

> [!abstract]
> The `'runtimepath'` (`rtp`) is the ordered list of directories where Neovim searches for runtime files. It decides which plugins, Lua modules and filetype scripts Neovim can find. A plugin "exists" for Neovim only when its root directory is in `rtp`: to install a plugin is, in the end, `vim.opt.rtp:prepend(dir)`.

## Definition

Let $R = (d_1, d_2, \dots, d_n)$ be the value of `'runtimepath'`, an ordered list of directories. Let $p$ be a relative runtime path, for example `plugin/*.lua` or `lua/foo.lua`.

- A lookup of $p$ checks $d_1/p, d_2/p, \dots, d_n/p$ in this order.
- For a single file (a colorscheme, a Lua module), the first match wins.
- For startup and filetype scripts (`plugin/`, `ftplugin/`), Neovim sources all matches, in the order of $R$.

Each $d_i$ can hold the standard subdirectories: `plugin/`, `lua/`, `ftplugin/`, `after/`, `colors/`, `syntax/`, `doc/`, `autoload/`.

## Properties

- Order is precedence: `vim.opt.rtp:prepend(d)` gives $d$ the highest priority; `vim.opt.rtp:append(d)` gives it the lowest.
- Default entries include the user config dir (`stdpath("config")`), the packages of `'packpath'` and `$VIMRUNTIME`.
- `after/` subdirectories load last, so they override other runtime files.
- `:set rtp?` or `:lua print(vim.o.rtp)` shows the current value.

## Links

- Used by [[lua require resolution]]: `require` searches `lua/` in each $d_i$
- Used by [[lazy.nvim bootstrap]]: it prepends the lazy.nvim directory to `rtp`
- Source: [[lazy.nvim explained - TJ video]]
