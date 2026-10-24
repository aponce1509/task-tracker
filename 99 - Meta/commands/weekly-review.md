---
description: Open or close the week - start picks one focus and a backlog with task-planner, end is the weekly spotlight with recall, old rfm, stale issues and silent PARs
argument-hint: "[start | end], default by weekday (Monday to Thursday start, Friday to Sunday end)"
---

Run the weekly review: $ARGUMENTS

Start plans the next seven days: one focus, a short backlog, one capture review. End is the only weekly moment that looks at the system, in fifteen minutes.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - Start Week.md` or `WORKFLOWS - End Week.md`. It wins over anything else here.
- The `task-planner` skill, the `note-issue` skill, the `obsidian-vault-notes` skill.

## Mode

- `start` or `end` in $ARGUMENTS picks the mode; empty → by weekday. Say which mode you picked.
- The weekly note is `07 - Daily/Weeks/YYYY-Www.md` (ISO week). When it is missing, create it with `obsidian create path="07 - Daily/Weeks/YYYY-Www.md" template="Weekly Note - Template" silent`; never by hand.

## Start

1. Last week. Read last week's note: highlights and the tasks that rolled over.
2. Focus. Show the active PARs (`rg -l 'active: true' "01 - PAR" -g '!archive/**' -g '!wip_paras/**'`) with their `bridge`. I pick one focus.
3. Backlog. Run the `task-planner` skill for the week: P1 issues, due dates, unblocked dependencies. Rolled tasks enter only when they still matter; for the others propose a lower priority on their issue.
4. Bookings. Propose the PAR of the focus for one `/review-captures`. On every second week (odd ISO week number), book `/sweep` too.
5. Show the block for the top of the weekly note (focus, backlog with issue links, bookings); wait for approval, then write it under the H1.

## End

1. Board. Run `bash scripts/spotlight.sh` and show the rows Unrecalled, Rfm flags, Issues, PARs, Journals.
2. Completed. List the issues done this week: files in `08 - Issues/complete/` changed this week, and the `done` entries of the journals (`journal.sh show --project <par>`). Write them under `## Completed tasks` after approval.
3. Workload. Tasks that rolled every day this week (same task in the `## Plan` of several daily notes): drop, split, or back to the issue with a lower priority. One decision each.
4. Recall. Offer `/recall week`.
5. Open questions. Each `#rfm` line in a note untouched for a week: answer (write it, remove the tag), issue (`/create-issue`), or delete. One at a time.
6. Issues. A `wip` issue not touched this week: `blocked`, back to `inbox`, or `/complete-issue`. A done-rule break: offer the fix of `/complete-issue` step 7.
7. PARs. A silent project (spotlight row PARs): `/close-par` (paused) or a reason in its PAR note.
8. Highlights. Ask for 2 or 3 lessons or milestones; write them at the top of the weekly note. Set `cleanSystem: true`.

## Output

- Start: focus, backlog, bookings as written.
- End: the decisions per row, highlights, `cleanSystem` state, and what is left for next week.

## Rules

- Every change to an issue or a PAR waits for my approval.
- Timecap 15 minutes. When the time is up, stop between steps and list what is left for next week.
- Never fix an engine or guidance finding here; it waits for the sweep or becomes an issue.
