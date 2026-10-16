---
paras:
  - "[[second-brain]]"
type:
subtypes:
rate:
tags:
status:
maturity: capture
created: 2026-02-15 20:02
---

# [[Alejandro's Mise-en-Place]]

> [!important] The Mise-en-Place just the consistence and the disciple. It is
> built from:
>
> - Rules
> - Workflows & Checklists
> - Working Place

## Rules

[[Rules]]

- [[Properties & Bases]]: has rules inside
- [[Notes Colours Rules]]
- [[Keeping the Focus]]
- [[The Hemingway Bridge]]
- [[Dial Down the Scope]]
- [[The Archipelago of Ideas]]

## Workflows

[[The Maintenance System]]

## Apps (tools) and layout

### Obsidian

- Entry point daily note
- At the beginning of the day we take the weekly note to define the day
- At the end we move ideas and issues around
- One layout per context, built by the `mise-en-place` plugin
  ([[_I00028 One layout per project, switched with leader hotkeys]])
  - Base (`<leader> l l`): Today dashboard (left) · today note (right-top) ·
    weekly note (right-bottom)
  - Today dashboard (`<leader> t`), driven by keys like a TUI: habits (the daily
    note properties, last 7 days), the week, the plan (`## Plan` of the daily
    note) and the active projects with their bridge and open issues; `?` shows
    the keys
    - Each panel has tabs that `[` and `]` rotate: Day (habits, log, learned),
      Week (habits, notes, done, learned), Projects (issues, bridges only);
      panels and tabs are defined in `dashboard.panels` of the config
    - `a` adds a task in a plan tab or a line in a section tab, `D` removes it;
      the selected row wraps, so long text shows in full
  - Bridge: the `bridge` property of each PAR holds the next concrete action
    ([[The Hemingway Bridge]]); `b` in the dashboard or `<leader> p B` writes
    it, and it shows when the project layout opens
  - Project (`<leader> l` + `a` `s` `d` `f` `;`): working notes as tabs (left) ·
    PAR note (right-top) · today note (right-bottom)
  - The working notes of a project live in its bookmark group under
    `Mise-en-Place`; leaving the layout saves the open left tabs back to it
  - New PAR: `<leader> l S` adds a slot for every active PAR; the slot order is
    the order of the bookmark groups
  - Memory: the structure always comes from the config; on top of it each layout
    keeps the extra notes I opened in each pane and the tab in front, per
    project and per mode; notes in extra splits come back as left tabs;
    `<leader> l r` forgets the extras
  - Laptop: each layout has a compact variant, one pane with the same notes as
    tabs; it is used when the window is narrower than `compactBelow`, and
    `<leader> l m` forces compact or wide
- Keys like nvim
  - `<leader>`: `Space` in vim normal mode and anywhere I am not typing;
    `Ctrl+Space` always
  - `<localleader>`: `\` for actions on the current note (format, fields,
    rename, move); keys per `file_class` are possible
  - A which-key popup shows the next keys; `Esc` closes it, `Backspace` goes up
  - File explorer keys like nvim-tree, with no leader: `a` new file (`/` at the
    end = folder), `A` folder, `r` rename, `d` delete, `x` / `c` / `p` cut,
    copy, paste, `y` / `Y` name, path, `hjkl` move, `o` `t` `v` `s` open, `?`
    all keys
  - Obsidian is an app, not a terminal: only L0 (`Cmd`) and L1 (`Opt`) can
    collide (see `~/.dotfiles/AGENTS.md`)
- Where to change it
  - Keys and layouts: `99 - Meta/mise-en-place.jsonc` (reloads on save)
  - Vim entry points: `.obsidian.vimrc`
  - Code: `.obsidian/plugins/mise-en-place/main.js`

### Code Development

%% Hay tareas relacionadas con esto - proyecto especifico para su elaboración %%

- Code Development environment
  - VSCode as base
  - AI and Note integration
  - Look for CLI useful tools

## AI Agents, Prompts & Tools
