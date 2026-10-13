---
file_class: issue
paras:
  - "[[second-brain]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - improvement|improvement]]"
role:
priority: 1
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-14 00:35
dueDate:
dependencies:
---
# [[_I00026 Build an active-projects dashboard in the daily note]]

> [!abstract] Summary
> Each active project needs its own Hemingway bridge: the point where I stopped and the next action. A dashboard of the active projects in the daily note shows every bridge in one place and becomes the entry point of the day.

> [!question] Open design
> Where the bridge of each project lives is not decided yet. It is the first task of this issue.

## Description

- [[The Hemingway Bridge]]: end a session when the next step is clear, and write it down to resume without friction.
- Today [[WORKFLOWS - Start Day]] crosses one bridge: the `Next:` line of yesterday's Daily Log. With several active projects, one line per day loses the bridge of every project I did not touch yesterday.
- The Daily Note template has no queries. The only Active Projects view is in the weekly template, and it embeds `04 - Bases/archive/All Paras new.base`, a retired base. `04 - Bases/final-bases/` has no PAR base; only the `["active":true]` search recipe of [[Search & Base Queries Reference]] exists.
- Done when the Daily Note template embeds a dashboard of the active PARs that shows the bridge of each one, Start Day opens from it, and End Day writes the bridge of each project I touched.

## Tasks

- [ ] Design where the bridge of each project lives
  - Options: a `next:` property on the PAR note, the last entry of the project journal, the top `wip` issue of the PAR
  - A new property goes through [[WORKFLOWS - New Properties]]
  - The bridge must be cheap to write at the end of a session and readable in a base
- [ ] Create `04 - Bases/final-bases/pars.base` with an Active Projects view
  - Columns: PAR, bridge, `wip` and `blocked` issue counts, last activity, journal link
  - Add the row to [[Search & Base Queries Reference]]
- [ ] Embed the view in the Daily Note template, above the Daily Log
  - Repoint the Active Projects embed of the Weekly Note template to the new base
- [ ] Make it look good
  - Cards view, or a callout dashboard; one glance must give the next action per project
- [ ] Update [[WORKFLOWS - Start Day]] and [[WORKFLOWS - End Day]]
  - Start Day opens from the dashboard; End Day writes the bridge of each project touched
- [ ] Run the engine audit (bases check)


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