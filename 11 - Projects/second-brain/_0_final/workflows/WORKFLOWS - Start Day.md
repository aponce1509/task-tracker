---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
  - "[[Normative - Standards - workflow|workflow]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-14 00:20
---

# [[WORKFLOWS - Start Day]]

> [!summary] A five-minute setup that turns yesterday's bridge and the active
> projects into a short plan in the daily note. What is not written in the daily
> note does not exist today.

**Trigger:** the first time I open the vault in the day · **Timecap:** 5 minutes
· **Driven by:** `/day start`, the `task-planner` skill

## Steps

- Open the base layout with `<leader> l l`: the Today dashboard, the daily note
  and the weekly note. `<leader> t` focuses the dashboard.
- Cross the bridges ([[The Hemingway Bridge]]): the dashboard header shows
  yesterday's `Next:`, and each active project shows its `bridge`. Start with
  them when they still hold.
- Ask the `task-planner` for the ordered tree of candidate tasks. It reads the
  active PARs, their open issues, dependencies, priorities and due dates.
- Write the plan in `## Plan` of the daily note: one main objective and three
  to five tasks, linked to their issues. In the dashboard, `p` on an issue
  plans it and `a` adds a free task: small work that needs no issue.
  - Check the calendar first. The plan fits the free time, not the wish list.
- Look at the inbox count in the dashboard header, nothing more. A free slot later in the day can take
  one batch of [[WORKFLOWS - Out of the Inbox]].
- Set the workplace: open the project of the first task with `<leader> l` and
  its slot key, and close the tabs that are not the first task
  ([[The Workplace System]]).

## Tidies

- Nothing directly. It decides which notes the day's use will tidy.
