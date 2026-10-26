---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 1
rate:
tags:
status: wip
maturity: capture
created: 2026-10-18 09:38
dueDate:
dependencies:
  - "[[_I00032 Design of the feed]]"
  - "[[_I00045 LLM enrichment of the news with a switchable backend]]"
---
# [[_I00033 Integration of the feed with Obsidian]]
> [!abstract]
> - Render the enriched stories as news notes, expire them after 30 days and run the whole sync on its own.
> - Without this the news stays in a database that I never read.

## Description

Third step of [[Feed and News Design]]. Stories with two outlets or more become notes in `06 - Inputs/News/`, a folder that git ignores; kept stories go to `06 - Inputs/News/_kept/`. The Mise-en-Place plugin runs `feeds_sync.py sync` every 2 hours; render and purge join that run. Done means fresh story notes appear without a manual step, notes older than 30 days and not kept are gone, and a base lists the news by group.

## Tasks

- [x] Approve the metadata through `/new-system-element`
  - Class `news`: `group`, `story_id`, `outlets`, `blindspot`, `first_seen` (the lean counts stay in the body, the update time is the file time)
  - Subtype `news` under Resources
- [x] Render in `feeds_sync.py render`
  - File name `YYYY-MM-DD <first title>`, fixed; H1, summary and coverage list follow the latest enrichment
  - Skip one-outlet stories and the group `other`
  - Only `status: inbox` notes are rewritten; the stories dismissed in the pane are skipped
- [x] Purge in `feeds_sync.py purge`: notes with `status: inbox` older than 30 days, and their rows
  - Also the inbox notes of merged stories; `done` notes move to `_kept/`
- [x] `.gitignore`: `06 - Inputs/News/*` except `_kept/`
- [x] Base `news.base`: Today and Inbox grouped by group, Blind spots, Kept, Purge
- [x] Scheduled sync in Mise-en-Place every 2 hours, `<leader> F s` on demand, log in `~/.config/feeds/logs/sync.log`
- [x] Add `render` and `purge` to `feeds_sync.py sync`
  - `enrich` is in `sync` since [[_I00045 LLM enrichment of the news with a switchable backend]]
- [x] Last good run as a row of the [[The Maintenance System]] spotlight
  - The Inbox and References rows skip `06 - Inputs/News/`

## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas