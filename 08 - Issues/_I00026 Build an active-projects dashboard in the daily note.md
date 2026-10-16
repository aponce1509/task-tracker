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
status: wip
maturity: capture
created: 2026-10-14 00:35
dueDate:
dependencies:
---
# [[_I00026 Build an active-projects dashboard in the daily note]]

> [!abstract] Summary
> Each active project needs its own Hemingway bridge: the point where I stopped and the next action. A keyboard-driven Today dashboard shows the habits, the week, the plan of the day and every active project with its bridge and open issues, and becomes the entry point of the day.

> [!info] Decisions
> - The bridge lives in a `bridge` property on the PAR note (`par` class, Input). No date property: staleness is not tracked.
> - No embed in the Daily Note template and no `pars.base`: the dashboard of the `mise-en-place` plugin is the view, opened in the base layout (`<leader> l l`) and with `<leader> t`.
> - The plan of the day lives in a `## Plan` section of the daily note; every top-level bullet there is a task.
> - Writing the bridge is manual (`b` in the dashboard, `<leader> p B`); nothing asks for it on leave.

## Description

- [[The Hemingway Bridge]]: end a session when the next step is clear, and write it down to resume without friction.
- Two levels of bridge:
  - Project bridge: the `bridge` property of each active PAR, shown in the dashboard, in the `<leader> l` slot list and when the project layout opens.
  - Day bridge: the `Next:` line of the Daily Log, which names the project to start tomorrow; the dashboard header shows yesterday's.
- Dashboard panels: Habits (the properties of the Daily Note template, last 7 days), Week (the properties of the Weekly Note template), Plan (`## Plan` of today's note), Projects (slots, bridge, open issues by status, priority and due date).
- Keys and settings: `contexts.dashboard` and `dashboard` in `99 - Meta/mise-en-place.jsonc`.
- Related: [[_I00028 One layout per project, switched with leader hotkeys]] (layouts, slots, the plugin).
- Done when Start Day opens from the dashboard and End Day writes the bridge of each project I touched.

## Tasks

- [x] Design where the bridge of each project lives
  - Done: `bridge` property on the PAR note, through [[WORKFLOWS - New Properties]] (class, schemas, template, search recipes, audit clean)
- [x] Build the dashboard view
  - Done: `mise-en-place` plugin, Today pane in the base layout, keys like a TUI
- [x] Add `## Plan` to the Daily Note template
- [x] Update [[WORKFLOWS - Start Day]] and [[WORKFLOWS - End Day]]
  - Start Day opens from the dashboard; End Day writes the bridge of each project touched
- [ ] Repoint the Active Projects embed of the Weekly Note template
  - It embeds `All Paras new.base`, a retired base; the dashboard may replace the section
- [ ] Use it for a week, then tune the panels and keys


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