---
description: Open or close the day - start crosses yesterday's bridge and plans the day with task-planner, end logs the day, sweeps the flags and writes the bridge
argument-hint: "[start | end], default start when today's Plan is empty, else end"
---

Run the day: $ARGUMENTS

The day has two short moments. Start turns yesterday's bridge and the active projects into a plan in the daily note; end logs what happened, closes what finished and leaves a bridge for tomorrow. What is not written in the daily note does not exist today.

## Load first

- The workflow note of the mode: `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - Start Day.md` or `WORKFLOWS - End Day.md`. It wins over anything else here.
- `start`: the `task-planner` skill. `end`: the `note-issue` skill.
- Always the `obsidian-vault-notes` skill and its `references/writing-style.md`.

## Mode

- `start` or `end` in $ARGUMENTS picks the mode.
- Empty: open today's daily note (`obsidian daily:path`; file `07 - Daily/YYYY-MM-DD.md`). Its `## Plan` has no task → `start`, else `end`. Say which mode you picked.

## Start

1. Daily note. Open it; when it is missing, create it with `obsidian daily` (the template fills it). Never write the template by hand.
2. Bridges. Read the `Next:` line at the end of `## Daily Log` of the last daily note before today, and the `bridge` property of each active PAR (`rg -l 'active: true' "01 - PAR" -g '!archive/**' -g '!wip_paras/**'`). Show them first.
3. Candidates. Run the `task-planner` skill: the ordered tree of candidate tasks.
4. Calendar. Ask for the free slots or meetings of today, in one question. Never invent a meeting.
5. Propose the plan: one main objective and 3 to 5 tasks, each linked to its issue, sized to the free time. Wait for approval.
6. Write the approved plan under `## Plan` of the daily note, as bullets.
7. Spotlight line: `bash scripts/spotlight.sh | sed -n '3p'` (the Inbox row). Print it, nothing more.

## End

1. What changed today: `git status --short` and `git log --since=midnight --name-only --pretty=format:`, plus `find . -name '*.md' -newermt "$(date +%Y-%m-%d)" -not -path './.*'`. Issues first, then the other notes.
2. Daily Log. Draft the lines from the changed notes: what I did and what I discovered, with links. Ask for the unplanned tasks.
3. Finished issues. An issue of today with every task checked → offer `/complete-issue <issue>` for each. Unfinished tasks stay in their issue.
4. Todo sweep. Run the steps of `/todo-sweep today` on the notes changed today.
5. Learned. When `## Learned` of today has links, offer `/recall today`.
6. Bridges.
	- Day: propose the `Next:` line (the project and the first concrete action for tomorrow) from the open tasks of today's issues.
	- Project: for each active PAR touched today, propose its `bridge` text.
7. Show the log lines and both bridges; wait for approval. Then write the log under `## Daily Log`, `Next: ...` as its last line, and each approved `bridge` in its PAR frontmatter.
8. Remind me of the habits in the dashboard (`x`, `+`, `-`) and to close the tabs. Do not tick habits yourself.

## Output

- Start: the bridges, the tree, the plan as written, the spotlight line.
- End: the log as written, the issues offered for closing, the todo decisions, the bridges.

## Rules

- Start never processes the inbox and never changes issue properties; the plan only links issues.
- End never writes a bridge without my confirmation, and never writes to a journal; only `/complete-issue` logs.
- Daily note lines read as my own notes: short, no sentences addressed to me.
