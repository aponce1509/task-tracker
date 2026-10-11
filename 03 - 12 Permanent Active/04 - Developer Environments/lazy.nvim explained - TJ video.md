---
paras:
  - "[[04_developer_environments]]"
type: "[[Resources]]"
subtypes: 
  - "[[External Knowledge - Resources - video]]"
rate:
tags: learnable
status: 
maturity: capture
---
# [[lazy.nvim explained - TJ video]]

> [!summary]
>
> NVIM advent, just explain how the lazy package manager works

- In lua the `require` import lua file that are in directory inside a `lua`
  directory that is inside a directory that lua has in it's path.

Entender lo que hace la instalación es bastante simple:

## Install Logic


```lua
-- Bootstrap lazy.nvim
-- crea el path donde va a guardar las cosas
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  -- Si no existe clona lazy.nvim repo
  local lazyrepo = "https://github.com/folke/lazy.nvim.git"
  local out = vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable", lazyrepo, lazypath })
  if vim.v.shell_error ~= 0 then
    vim.api.nvim_echo({
      { "Failed to clone lazy.nvim:\n", "ErrorMsg" },
      { out, "WarningMsg" },
      { "\nPress any key to exit..." },
    }, true, {})
    vim.fn.getchar()
    os.exit(1)
  end
end
-- Add it to the lua path. THATs all
vim.opt.rtp:prepend(lazypath)

-- Now just some particularities

-- Make sure to setup `mapleader` and `maplocalleader` before
-- loading lazy.nvim so that mappings are correct.
-- This is also a good place to setup other settings (vim.opt)
vim.g.mapleader = " "
vim.g.maplocalleader = "\\"

-- Setup lazy.nvim
require("lazy").setup({
  spec = {
    -- YOU need to say whick directory has lua file that returns plugins to install
    -- import your plugins
    { import = "plugins" },
  },
  -- Configure any other settings here. See the documentation for more details.
  -- colorscheme that will be used when installing plugins.
  install = { colorscheme = { "habamax" } },
  -- automatically check for plugin updates
  checker = { enabled = true },
})
```

## What is done when a plugin is created

- you clone the repo in `vim.fn.stdpath("data") .. "lazy"`
- Add to the repo to the runtime path.
- The config function is executed when the plugin is loaded

## Other comments

- Don't copy and paste without understanding
- When starting with NeoVim, make something minimal and start coding.
