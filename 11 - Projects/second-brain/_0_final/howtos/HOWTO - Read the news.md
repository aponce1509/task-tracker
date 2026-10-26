---
paras:
  - "[[second-brain]]"
  - "[[create-a-feed]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - guide|guide]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-26 13:30
---
# [[HOWTO - Read the news]]

> [!abstract] The news reads itself in; I only read, keep or dismiss
> - Mise-en-Place runs `feeds_sync.py sync` every 2 hours while Obsidian is open: fetch, stories, LLM summary, notes, purge.
> - `<leader> F n` opens the News pane: one tab per group, the biggest stories first.
> - A story I want to keep goes to `06 - Inputs/News/_kept/` with `y`; everything else is deleted after 30 days.

> [!info] Why a pane and notes
> - The pane is fast to scan and shows every source; the note is what links and searches find.
> - Only stories with two outlets or more get a note, so one outlet's scoop stays in the pane (`m`).

## Read

- `<leader> F n` opens the pane. `[` and `]` (or `h` and `l`) change the group, `j` and `k` move.
- The row shows the number of outlets, the `L · C · R` mix and `no L` or `no R` for a blind spot.
- The preview shows the summary and every source. `o` opens a source in the browser, `Enter` opens the note.
- A framing mark (critical, favourable) is the LLM label of one headline: a hint, never the main signal.

## Keep, capture, dismiss

- `y` keeps the story: the note gets `status: done` and moves to `_kept/`, which git tracks. The sync never writes it again, so I can add my own lines.
- `c` makes one source a normal capture (`capture_import.py --url`); it goes to the Captures queue.
- `d` dismisses the story: it leaves the pane and its note goes to the trash, for good.
- Setting `status: done` on a note by hand works the same as `y`: the next sync moves it to `_kept/`.

## Sync and check

- `s` in the pane or `<leader> F s` anywhere syncs now. The notice shows what each step did.
- The log is `~/.config/feeds/logs/sync.log`. The spotlight row News sync turns `!` after 6 hours or a failed run.
- `news.base` has the same notes as tables: Today, Inbox, Blind spots, Kept, Purge.
- From a terminal: `uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" stories --since 24h`.

## Change

- Outlets, their lean and the groups: `99 - Meta/scripts/feeds/sources.yaml`.
- The LLM provider: `feeds.llm` and `feeds.fallback` in `99 - Meta/mise-en-place.jsonc`.
- The keys: `contexts.news` in the same file.
- The design and its reasons: [[Feed and News Design]].
