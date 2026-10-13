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
# [[lua require resolution]]

> [!abstract]
> In Neovim, `require(name)` finds a Lua module through the `lua/` subdirectory of each directory of the [[runtimepath]]. The dots of the name become path separators: `require("a.b")` loads `lua/a/b.lua` or `lua/a/b/init.lua`. The first match wins, and the result is cached in `package.loaded`, so a second call does not run the file again.

## Definition

Let $R = (r_1, \dots, r_m)$ be the ordered directories of the [[runtimepath]]. Let $n = s_1.s_2.\cdots.s_k$ be a module name, and let $p(n) = s_1/s_2/\cdots/s_k$.

The candidate files for $n$ are, in order:

$$C(n) = \big(\, r_i/\texttt{lua}/p(n)\texttt{.lua},\;\; r_i/\texttt{lua}/p(n)/\texttt{init.lua} \,\big)_{i=1}^{m}$$

`require(n)` does these steps:

- If `package.loaded[n]` is set, it returns that value and does not read a file.
- Else it runs the first file of $C(n)$ that exists, stores its return value $v$ in `package.loaded[n]`, and returns $v$.
- If no file of $C(n)$ exists, it raises an error.

## Properties

- Order matters: a directory that is earlier in the [[runtimepath]] shadows a later one. `vim.opt.rtp:prepend(dir)` gives `dir` the highest priority.
- A directory becomes a module when it holds `init.lua`.
- Cache: to load a file again, clear the entry first (`package.loaded[n] = nil`).

## Example

With `~/.config/nvim` in the [[runtimepath]], `require("plugins.telescope")` loads `~/.config/nvim/lua/plugins/telescope.lua`.

## Links

- Uses [[runtimepath]]
- Used by [[lazy.nvim plugin spec]]: `{ import = "plugins" }` resolves the modules of `lua/plugins/`
- Source: [[lazy.nvim explained - TJ video]]
