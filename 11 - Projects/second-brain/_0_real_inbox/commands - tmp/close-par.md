Drives [[WORKFLOWS - End PAR]].

- Argument: `<par>`
- Load: `project-journaling`, `note-issue`, `note-index-moc`
- Steps
	- Triage: propose delete when the PAR is barely developed
	- List open issues; per issue: close, move PAR, keep as debt
	- Guided post-mortem from [[Postmortem Content]]: rate, one good, one bad
	- Draft the ending note (index or MoC of the solution and reusable parts), approval stop
	- `journal.sh close` through `project-journaling`
	- `active: false`, move to `01 - PAR/archive/`
- Output: issue decisions, post-mortem, ending note, close state
- Rules
	- Never delete without explicit approval
	- Ending note follows `note-index-moc`
