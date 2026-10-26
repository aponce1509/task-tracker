---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 1
rate: 3
tags:
status: done
maturity: capture
created: 2026-10-26 11:42
dueDate:
dependencies:
  - "[[_I00033 Integration of the feed with Obsidian]]"
---
# [[_I00046 News pane in Mise-en-Place]]

> [!abstract]
> - Read the news in a Mise-en-Place pane with one tab per interest group.
> - Without a fast view, a hundred story notes a day are noise, not an inbox.

## Description

View of [[Feed and News Design]], built like the Captures pane of [[The Workplace System]]. The plugin reads the JSON export that each sync writes, so it needs no SQLite. Done means a leader key opens the pane, the tabs follow the groups of `sources.yaml`, and I can open, keep, capture and dismiss stories with the keyboard.

## Tasks

- [x] JSON export in `feeds_sync.py export`: stories of the last 3 days with members, sides, summary, framing and the path of the note
- [x] Pane `News` in `.obsidian/plugins/mise-en-place/main.js`, registered like `CAPTURES_VIEW`
  - Tabs per group; list sorted by number of outlets, then by date
  - Row: title, `L · C · R` mix, blind-spot mark, age
  - Right side: summary and the source list with links
- [x] Keys: `j`/`k`, `o` open a source, `Enter` open the note, `y` keep, `c` source to capture, `d` dismiss, `?` help
  - `c` runs `capture_import.py --url <source>`
  - `d` writes `~/.config/feeds/dismissed.json`, read by `render`; `m` adds the one-outlet stories
- [x] Leader key and the keys in the mise-en-place config
- [x] How-to note for the news, linked from [[The Sources System]]

## Post-Mortem

- [x] We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved: the news inbox (Spanish and global news grouped by interest, with the bias shown) and my own feed tool in place of rss-dashboard ([[create-a-feed]]).
- Good things:
	- Notes as a view: SQLite holds the state and the notes are rendered from it, so merges and reclusters only redraw them.
	- The News pane reused the layout and the key system of the Captures pane.
	- The `/new-system-element` gate cut the class from 9 to 5 properties.
	- The whole chain runs with one key (`<leader> F s`) and shows in the spotlight.
- Bad Things:
	- Too much at once: two issues and a lot of output in one go, hard to follow.
	- Closed before real use: the problems of the pane come as new issues.
	- Story drift remains in long events ([[_I00048 Story drift in long news events]]).
- Rate (1-3): 3
- Notes created:
	- [[Feed and News Design]]
	- [[HOWTO - Read the news]]
