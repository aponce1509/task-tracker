---
paras:
  - "[[second-brain]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - guide|guide]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-16 18:00
---

# [[HOWTO - Change the dashboard keys]]

> [!abstract] The dashboard keys are a map from key to action Every key of the
> Today dashboard is one line in `contexts.dashboard.keys` of
> `99 - Meta/mise-en-place.jsonc`. Changing a key is moving a line; a new key
> reuses an existing action; only a new action needs code.

> [!warning] Keys the dashboard must not take
>
> - `Space` is the leader everywhere, also in the dashboard. Map it and the
>   leader is gone there.
> - `Ctrl+Space` is the leader chord; context keys ignore keys with `Ctrl`,
>   `Opt` or `Cmd`.

Part of [[The Workplace System]]. The explorer keys (`contexts.explorer`) work
the same way.

## Change or add a key

- Open `99 - Meta/mise-en-place.jsonc` and find `contexts.dashboard.keys`.
- One line per key:
  `"x": { "desc": "toggle habit / task", "action": "dashboard:toggle" }`.
  - The key is the character it types: `"x"`, `"D"` (Shift+d), `"+"`, `"]"`,
    `"?"`. Named keys: `"Enter"`, `"Tab"`, `"Escape"`.
  - `desc` is the text of the `?` popup.
- To move a key, change the key of the line. To add one, add a line with an
  action from the list below.
- A key can also run any Obsidian command:
  `"G": { "desc": "graph", "cmd": "graph:open" }`. Command ids: Settings →
  Hotkeys, or `obsidian commands`.
- A key can open a group of keys, like the leader:
  `"g": { "group": "go", "keys": { "w": { … } } }`.
- Save. `?` in the dashboard shows the new map.

## Actions

- Move: `dashboard:down`, `dashboard:up`, `dashboard:next-panel`,
  `dashboard:prev-panel`, `dashboard:panel-1` … `dashboard:panel-9`,
  `dashboard:next-tab`, `dashboard:prev-tab`.
- Open: `dashboard:open` (the row; a habit toggles), `dashboard:weekly`,
  `dashboard:refresh`, `dashboard:help`.
- Change: `dashboard:toggle`, `dashboard:increase`, `dashboard:decrease`,
  `dashboard:edit`, `dashboard:add-task` (a task in a plan tab, a line in a
  section tab), `dashboard:remove-task` (task or line), `dashboard:plan-issue`,
  `dashboard:bridge`.

## Add a new action

- Only when no action or command does it. The actions live in
  `dashboardActions()` of `.obsidian/plugins/mise-en-place/main.js`; the work
  goes in a method of the `Dashboard` class.
- Add the action as `"dashboard:<name>": d((v) => v.<method>())`, then map a key
  to it in the config.
- `<leader> R` reloads the config; a notice lists any unknown action id.
- Never name a `Dashboard` method `open`, `close`, `load` or `onOpen`: they
  belong to Obsidian's `View`.
