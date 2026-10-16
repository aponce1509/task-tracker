---
paras:
  - "[[second-brain]]"
  - "[[coding-workplace]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - guide|guide]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-16 18:00
---

# [[HOWTO - Change the system hotkeys]]

> [!abstract] First the layer, then the file
> - A hotkey belongs to exactly one layer of the machine.
> - Pick the layer, check the chord is free there, then edit the one file of that layer.
> - For Obsidian the answer is almost always a leader chain in `99 - Meta/mise-en-place.jsonc`.

> [!warning] Chords that are never free
> - `Cmd` alone: macOS (L0). `Opt`: skhd and yabai (L1), always active.
> - `Ctrl+a`, `Ctrl+b`, `Ctrl+\`: terminal leaders (mux, herdr, harness).
> - In Obsidian: `Space`, `Ctrl+Space` and `\` (the leaders).

Part of [[The Workplace System]]. The full contract is `~/.dotfiles/AGENTS.md`.

## Pick the layer

| The key acts on            | Layer             | File                                                   |
| -------------------------- | ----------------- | ------------------------------------------------------ |
| Desktops, windows, any app | L1 window manager | `~/.dotfiles/skhd/.skhdrc`                             |
| The terminal or its panes  | L2 / L3 wezterm   | `~/.dotfiles/wezterm/.wezterm.lua`                     |
| Agent tabs                 | L4 herdr          | `~/.config/herdr/config.toml`                          |
| Code in nvim               | L6 editor         | `~/.dotfiles/nvim/.config/nvim/lua/config/keymaps.lua` |
| Anything in Obsidian       | app               | `99 - Meta/mise-en-place.jsonc`                        |

- A chord that must work across layers (for example from any app into Obsidian)
  is an L1 chord in skhd, with an `Opt` combination that is free.

## In Obsidian: pick the place

- Something I do anywhere in Obsidian → a key under `leader.keys`. Put it in the
  group it belongs to (`l` layouts, `p` project, `f` find, `n` new, `w` windows,
  `b` tabs, `u` ui) or start a new group.
- An action on the note I am in → `localleader.keys`; only for one kind of note
  → `localleader.byClass.<file_class>`.
- A key in one pane, without a leader → `contexts.explorer.keys` or
  `contexts.dashboard.keys` ([[HOWTO - Change the dashboard keys]]).
- An entry point that must work in vim normal mode → `.obsidian.vimrc` (today
  only `Space` and `\`). Keep vimrc for vim motions; the actions go in the
  config.
- A plain Obsidian hotkey (Settings → Hotkeys) only when a leader chain is too
  slow, and never with `Cmd` or `Opt`.

## Add, change or remove a key

- Find the command id: Settings → Hotkeys (hover the command), or
  `obsidian commands`.
- Add the line, for example under the `f` group:
  `"o": { "desc": "outline", "cmd": "outline:open" }`.
- Other targets: `"layout": "base"`, `"project": "<PAR name>"`,
  `"open": "<note>"`, or `"group"` with `"keys"` for a new prefix.
- Change a key by renaming its line; remove it by deleting the line.
- Save. The popup of `<leader>` shows the change at once; a notice names any
  unknown command id.

## When a leader or a reserved chord changes

- Update `~/.dotfiles/AGENTS.md` §12 (Obsidian) and, for a machine-wide chord,
  §5 and §6.
- Check the old chord is not still bound in Settings → Hotkeys or in
  `.obsidian.vimrc`.
- Commit the vault and the dotfiles together, so the contract and the config
  agree.
