---
paras:
  - "[[second-brain]]"
  - "[[coding-workplace]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - design-doc|design-doc]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-16 18:00
---

# [[The Workplace System]]

> [!abstract] Obsidian as a keyboard-driven workplace
> - One small plugin, `mise-en-place`, turns Obsidian into the same kind of workplace as my terminal: nvim-style leader keys, one layout per project, and boards that hold the day, the week, the project, the maintenance and the captures.
> - Every key, layout and panel lives in one config file; the data stays in my notes.

> [!info] Where to change what
>
> - Keys, layouts, dashboard panels and tabs: `99 - Meta/mise-en-place.jsonc`
>   (reloads on save; JSONC, so `//` comments are fine).
> - Vim entry points (`Space`, `\` in normal mode): `.obsidian.vimrc`.
> - Behaviour (new actions, new tab kinds):
>   `.obsidian/plugins/mise-en-place/main.js`, plain JavaScript with no build
>   step.
> - The layer contract for keys across the whole machine:
>   `~/.dotfiles/AGENTS.md` (§12 for Obsidian).

It is the Obsidian part of [[The Mise-en-Place System]] and of the layered
workspace of [[_I00001 Multiple workspaces & tasks Workflow]]. It came from
[[_I00028 One layout per project, switched with leader hotkeys]] and
[[_I00026 Build an active-projects dashboard in the daily note]].

## Keys

- Obsidian is an app, not a terminal: only L0 (macOS, `Cmd`) and L1 (skhd and
  yabai, `Opt`) can collide with it. The plugin never takes `Cmd` or `Opt`
  chords.
- `<leader>` is `Space` in vim normal mode and anywhere I am not typing, and
  `Ctrl+Space` always (also in insert mode and text fields).
- `<localleader>` is `\`: actions on the current note. `localleader.byClass`
  adds keys per `file_class`.
- Keys chain like nvim. A which-key popup shows the next keys; `Esc` closes it
  and `Backspace` goes up one level.
- Contexts are bare keys with no leader that apply only while one pane is
  active: `explorer` (nvim-tree style), and `dashboard`, `project`, `spotlight`
  `captures` and `news` (TUI style, one per board). A key mapped
  in a context replaces the native key of that pane, so Space stays the leader
  in the explorer and Enter opens instead of renaming.

## Layouts

- Base (`<leader> l l`): the Today dashboard, the week board and the spotlight
  as tabs on the left, the daily note top-right, the weekly note bottom-right.
- Project (`<leader> l` then a slot key `a` `s` `d` `f` `;`): its working notes
  as tabs on the left, the project dashboard top-right, the daily note
  bottom-right. `o` in the project dashboard opens the PAR note.
- Slots are the subgroups of the `Mise-en-Place` bookmark group. Each subgroup
  is named after a PAR note and holds its working notes. Slots follow
  `active: true` on the PAR note on their own; `<leader> l S` syncs them by
  hand.
- Compact variants (`base.compact`, `project.compact`) put the same notes as
  tabs in one pane. They apply when the window is narrower than `compactBelow`;
  `<leader> l m` forces compact or wide.
- Memory: the defined structure always comes from the config. On top of it, each
  layout keeps the extra notes I opened per pane and the tab in front, per
  project and per mode. `<leader> l r` forgets them.

## Today dashboard

- `<leader> t` focuses it. The header shows the date, yesterday's `Next:` line
  and the inbox count.
- Panels come from `dashboard.panels`. Each panel has tabs that `[` and `]`
  rotate, and each tab shows one kind of rows:
  - `habits`: the properties of the note's template, with the last 7 days for
    daily notes.
  - `section`: the lines under a heading of the note (`@top` = under the title).
  - `tasks`: a plan section; every top-level bullet is a task.
  - `projects`: the slots with their bridge, with or without their open issues.
- The data stays in the notes: habits are properties, the plan is `## Plan` of
  the daily note, the bridge is the `bridge` property of each PAR
  ([[The Hemingway Bridge]]).

## Project dashboard

- `<leader> p o` focuses it; it replaces the PAR note in the project layout.
- Tabs come from `projectDashboard.tabs`: an overview, the issues, the journal
  and one tab per base of `04 - Bases/final-bases/`, rendered with the PAR note
  as `this`. Tabs that filter on note types become segments of a shelf (width =
  notes, strip = maturity).
- The overview shows the open issues as a flow, the desk (`## Index` and
  `## Comments` of the PAR note), the notes touched lately, the working set and
  the notes waiting to be distilled.
- `i` adds a note to the index, `c` writes a dated comment, `b` writes the
  bridge.

## Week board

- `<leader> W` focuses it; it is a tab of the base layout.
- The End Week checklist with live data: the focus (the lines under the title
  of the weekly note), a strip of the seven days (journal entries, concepts
  learned, plan tasks done), what got done in every journal, and the checks of
  [[WORKFLOWS - End Week]].
- It only reads the notes. Its only write is `cleanSystem` on the weekly note.

## Spotlight

- `<leader> S` focuses it; it is a tab of the base layout.
- It shows the rows of `scripts/spotlight.sh`, the spotlight of
  [[The Maintenance System]]: one count, a light and the workflow that clears
  it. `r` runs the script again.

## Captures queue

- `<leader> c` opens it: the notes with `file_class: capture` and
  `status: inbox`, with the note rendered beside the list.
- Keys set `paras`, type and subtype, the four tags and `rate`; `y` keeps the
  capture (`status: done`), `m` moves it (PAR folder first), `d` deletes it,
  `f` filters by platform and `i` runs the importer
  ([[HOWTO - Capture from the phone]]).

## News

- `<leader> F n` opens it: the stories of [[Feed and News Design]], one tab per group (`[` `]`), the biggest first, with the L / C / R mix and the blind spot.
- `o` opens a source, `y` keeps the story (its note goes to `06 - Inputs/News/_kept/`), `c` makes a source a capture, `d` dismisses, `m` adds the stories with one outlet, `s` syncs.
- It reads `~/.config/feeds/news.json` and reloads after each sync.

## Feeds sync

- While Obsidian is open, the plugin runs `feeds_sync.py sync` (fetch, cluster, LLM enrich, notes, purge, export) every `feeds.every` minutes (config `feeds`); `<leader> F s` runs it now ([[Feed and News Design]]).
- `feeds.llm` and `feeds.fallback` pick the LLM provider of the enrich step.
- The time of `~/.config/feeds/logs/sync.log` is the last run: a restart does not run it again, and a run missed while Obsidian was closed starts in the first five minutes. A failed run shows a notice.

## Rules for changes

- Change the config before the code. A new key, layout, panel or tab is config;
  only a new kind of behaviour needs code.
- A key goes to the layer that owns it ([[HOWTO - Change the system hotkeys]]).
- A new property used by the dashboard goes through
  [[WORKFLOWS - New Properties]].
- After a change, `<leader> R` reloads the config; unknown command ids and
  actions show in a notice.
- Code gotchas, learned the hard way:
  - `iterateRootLeaves` stops when the callback returns a truthy value: use a
    block body.
  - A view method named `open` overrides `View.open`, and the pane never mounts.
  - The file explorer keeps DOM focus on `<body>`: detect it by the active leaf,
    not by the event target.
  - Native pane keys run before plugin listeners: replace them in the pane's key
    scope.

## How-tos

- [[HOWTO - Tune the dashboard]]
- [[HOWTO - Read the news]]
- [[HOWTO - Change the dashboard keys]]
- [[HOWTO - Change the system hotkeys]]
