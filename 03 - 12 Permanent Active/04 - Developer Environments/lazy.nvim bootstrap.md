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
# [[lazy.nvim bootstrap]]

> [!abstract]
> The bootstrap is the code at the top of `init.lua` that installs lazy.nvim on first start and makes it loadable. It solves the "who installs the plugin manager" problem. Key idea: clone the repo to a fixed path $P$ if $P$ does not exist, then prepend $P$ to the runtimepath, so `require("lazy")` resolves.

## Definition

Let $D$ = `stdpath("data")` (for example `~/.local/share/nvim`), let $P = D$ + `/lazy/lazy.nvim`, and let $R$ be the runtimepath.

The bootstrap is the sequence:

- Compute $P$.
- If $P$ does not exist, `git clone --filter=blob:none --branch=stable` the lazy.nvim repo into $P$. On a clone error, show the error and exit.
- Set $R \leftarrow (P, R)$, that is, `vim.opt.rtp:prepend(lazypath)`. Now the `lua/lazy/` directory of $P$ is visible to `require`.
- Set `vim.g.mapleader` and `vim.g.maplocalleader`. This must occur before setup, because plugin specs read the leader when they define mappings.
- Call `require("lazy").setup({ spec = ... })`.

```lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable",
    "https://github.com/folke/lazy.nvim.git", lazypath })
end
vim.opt.rtp:prepend(lazypath)
vim.g.mapleader = " "
require("lazy").setup({ spec = { { import = "plugins" } } })
```

## Properties

- Idempotent: after the first start, the `fs_stat` check is true and no clone occurs. The cost is one file system call.
- The install is only a clone plus a runtimepath change. Nothing else is special about lazy.nvim. lazy.nvim then applies the same two steps to each plugin.

## Links

- Uses [[runtimepath]]
- Leads to [[lazy.nvim plugin spec]] through `require("lazy").setup({ spec = ... })`
- Source: [[lazy.nvim explained - TJ video]]
